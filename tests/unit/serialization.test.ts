import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEmptyProject, type PhotoAsset } from '../../src/domain/project.ts';
import { normalizedResumeLocation, referencedAssetIds, validateProjectState, InvalidSavedProjectError } from '../../src/persistence/serialization.ts';

function fixture() {
  const state = createEmptyProject('project-1');
  const blob = new Blob(['photo'], { type: 'image/png' });
  const asset: PhotoAsset = { id: 'asset-1', blob, mime: 'image/png', fileName: 'photo.png', byteSize: blob.size, decodedWidth: 100, decodedHeight: 100, importedAt: '2026-09-23' };
  state.assets[asset.id] = asset;
  state.project.photoItems['item-1'] = { id: 'item-1', assetId: asset.id, createdAt: '2026-09-23' };
  state.project.photoItems['item-2'] = { id: 'item-2', assetId: asset.id, createdAt: '2026-09-23' };
  state.project.months[1].photoItemId = 'item-1';
  state.project.months[1].crop = { zoom: 1.5, offsetX: 0.2, offsetY: -0.3 };
  state.project.months[2].photoItemId = 'item-2';
  state.project.months[2].crop = { zoom: 1, offsetX: 0, offsetY: 0 };
  return state;
}
test('valid saved project retains one asset behind independently assigned reused photo items', () => {
  const state = fixture();
  assert.equal(validateProjectState(state).project.id, 'project-1');
  assert.deepEqual([...referencedAssetIds(state.project)], ['asset-1']);
});
test('restore rejects malformed colors, crops, missing assets and unsupported schema', () => {
  const state = fixture();
  const badColor = structuredClone(state); badColor.project.months[1].style.background = '#abc';
  assert.throws(() => validateProjectState(badColor), InvalidSavedProjectError);
  const badCrop = structuredClone(state); badCrop.project.months[1].crop!.zoom = 4;
  assert.throws(() => validateProjectState(badCrop), InvalidSavedProjectError);
  const missingAsset = structuredClone(state); delete missingAsset.assets['asset-1'];
  assert.throws(() => validateProjectState(missingAsset), InvalidSavedProjectError);
  const badSchema = structuredClone(state); (badSchema.project as {schemaVersion:number}).schemaVersion = 2;
  assert.throws(() => validateProjectState(badSchema), InvalidSavedProjectError);
});
test('invalid saved location falls back to Review without altering project content', () => {
  const state = fixture();
  (state.project as {lastLocation:{screen:string;month?:number}}).lastLocation = { screen: 'editor', month: 13 };
  assert.deepEqual(normalizedResumeLocation(state.project), { screen: 'review' });
  assert.equal(validateProjectState(state).project.lastLocation.screen, 'review');
  assert.equal(state.project.months[1].photoItemId, 'item-1');
});
