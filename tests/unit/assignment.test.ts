import assert from 'node:assert/strict';
import test from 'node:test';
import { addImportedAssets, applyAssignment } from '../../src/domain/assignment.ts';
import { assertProjectInvariants, createEmptyProject, isMonthReady, readyCount, unassignedItems, type PhotoAsset, type ProjectState } from '../../src/domain/project.ts';

function asset(id: string): PhotoAsset {
  return { id, blob: new Blob([id], { type: 'image/png' }), mime: 'image/png', fileName: `${id}.png`, byteSize: id.length,
    decodedWidth: 1000, decodedHeight: 1500, importedAt: '2026-09-23T00:00:00.000Z' };
}
function twoPhotos(): ProjectState {
  return addImportedAssets(createEmptyProject('project'), [asset('a'), asset('b')], ['item-a', 'item-b']).state;
}
function style(state: ProjectState, month: 1 | 2 | 3, background: `#${string}`): ProjectState {
  return { ...state, project: { ...state.project, months: { ...state.project.months,
    [month]: { ...state.project.months[month], style: { background, text: { mode: 'custom', color: '#123456' } } } } } };
}

test('bulk import maps returned order to January and February, with ten Missing months', () => {
  const state = twoPhotos();
  assert.equal(state.project.months[1].photoItemId, 'item-a');
  assert.equal(state.project.months[2].photoItemId, 'item-b');
  assert.equal(state.project.months[3].photoItemId, null);
  assert.equal(readyCount(state), 2);
  assert.equal(isMonthReady(state, 1), true);
  assert.equal(unassignedItems(state.project).length, 0);
  assertProjectInvariants(state);
});

test('Move uses an empty target, resets both crops, and keeps month styles', () => {
  let state = style(twoPhotos(), 1, '#112233');
  state = style(state, 3, '#AABBCC');
  state.project.months[1].crop = { zoom: 2, offsetX: .5, offsetY: -.3 };
  const moved = applyAssignment(state, { type: 'move', source: 1, target: 3 }).state;
  assert.equal(moved.project.months[1].photoItemId, null);
  assert.equal(moved.project.months[1].crop, null);
  assert.equal(moved.project.months[3].photoItemId, 'item-a');
  assert.deepEqual(moved.project.months[3].crop, { zoom: 1, offsetX: 0, offsetY: 0 });
  assert.equal(moved.project.months[1].style.background, '#112233');
  assert.equal(moved.project.months[3].style.background, '#AABBCC');
  assert.equal(state.project.months[1].photoItemId, 'item-a');
  assert.throws(() => applyAssignment(state, { type: 'move', source: 1, target: 2 }));
});

test('Swap exchanges occupied items and resets crops without changing either style', () => {
  let state = style(twoPhotos(), 1, '#112233');
  state = style(state, 2, '#AABBCC');
  state.project.months[1].crop = { zoom: 2, offsetX: 1, offsetY: 0 };
  state.project.months[2].crop = { zoom: 3, offsetX: -1, offsetY: 0 };
  const swapped = applyAssignment(state, { type: 'swap', source: 1, target: 2 }).state;
  assert.equal(swapped.project.months[1].photoItemId, 'item-b');
  assert.equal(swapped.project.months[2].photoItemId, 'item-a');
  assert.equal(swapped.project.months[1].crop?.zoom, 1);
  assert.equal(swapped.project.months[2].crop?.zoom, 1);
  assert.equal(swapped.project.months[1].style.background, '#112233');
  assert.equal(swapped.project.months[2].style.background, '#AABBCC');
  assert.deepEqual(unassignedItems(swapped.project), []);
});

test('Remove to Unassigned, then Replace displaces the old item without deleting it', () => {
  let state = twoPhotos();
  state = applyAssignment(state, { type: 'remove', source: 2 }).state;
  assert.equal(isMonthReady(state, 2), false);
  assert.deepEqual(unassignedItems(state.project).map(item => item.id), ['item-b']);
  state = applyAssignment(state, { type: 'replace', target: 1, itemId: 'item-b' }).state;
  assert.equal(state.project.months[1].photoItemId, 'item-b');
  assert.deepEqual(unassignedItems(state.project).map(item => item.id), ['item-a']);
  assert.throws(() => applyAssignment(state, { type: 'replace', target: 1, itemId: 'item-b' }));
});

test('Reuse creates an independent item sharing an asset, and deleting one item preserves the source', () => {
  let state = twoPhotos();
  state = applyAssignment(state, { type: 'reuse', source: 1, target: 3, newItemId: 'copy-a', createdAt: '2026-09-23T01:00:00.000Z', replace: false }).state;
  assert.equal(state.project.photoItems['copy-a'].assetId, 'a');
  assert.equal(state.project.photoItems['item-a'].assetId, 'a');
  assert.equal(state.project.months[1].photoItemId, 'item-a');
  state = applyAssignment(state, { type: 'remove', source: 3 }).state;
  const deleted = applyAssignment(state, { type: 'delete-unassigned', itemId: 'copy-a' });
  assert.deepEqual(deleted.deletedAssetIds, []);
  assert.ok(deleted.state.assets.a);
  assert.equal(deleted.state.project.months[1].photoItemId, 'item-a');
  assert.throws(() => applyAssignment(deleted.state, { type: 'delete-unassigned', itemId: 'item-a' }));
});

test('occupied reuse requires explicit replace and displaces target item', () => {
  const state = twoPhotos();
  assert.throws(() => applyAssignment(state, { type: 'reuse', source: 1, target: 2, newItemId: 'copy', createdAt: '', replace: false }));
  const result = applyAssignment(state, { type: 'reuse', source: 1, target: 2, newItemId: 'copy', createdAt: '', replace: true }).state;
  assert.equal(result.project.months[2].photoItemId, 'copy');
  assert.deepEqual(unassignedItems(result.project).map(item => item.id), ['item-b']);
});

test('bulk limit rejects all >12 without mutating the original project', () => {
  const state = createEmptyProject('project');
  assert.throws(() => addImportedAssets(state, Array.from({ length: 13 }, (_, i) => asset(String(i))), Array.from({ length: 13 }, (_, i) => `item-${i}`)));
  assert.equal(readyCount(state), 0);
});
