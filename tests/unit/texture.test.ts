import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyProject } from '../../src/domain/project.ts';
import { applyColorBatch, restoreColorBatch } from '../../src/domain/batchColors.ts';
import { buildMonthRenderModel } from '../../src/domain/renderModel.ts';
import { isTextureId, polkaDotAppearance, TEXTURE_OPTIONS } from '../../src/domain/texture.ts';
import { validateProjectState, InvalidSavedProjectError } from '../../src/persistence/serialization.ts';

test('V1.1 textures are seven bounded choices and legacy months stay untextured', () => {
  const state = createEmptyProject('texture-unit');
  assert.deepEqual(TEXTURE_OPTIONS.map(option => option.id), ['none', 'lines', 'grid', 'waves', 'dots', 'paper', 'vellum']);
  assert.equal(buildMonthRenderModel(1, state).texture, 'none');
  state.project.months[1].style.texture = 'waves';
  assert.equal(buildMonthRenderModel(1, state).texture, 'waves');
  assert.equal(buildMonthRenderModel(2, state).texture, 'none');
  assert.equal(validateProjectState(state).project.months[1].style.texture, 'waves');
  state.project.months[2].style.texture = 'vellum';
  assert.equal(buildMonthRenderModel(2, state).texture, 'vellum');
  assert.equal(validateProjectState(state).project.months[2].style.texture, 'vellum');
});

test('saved project rejects unknown texture IDs', () => {
  const state = createEmptyProject('texture-invalid');
  (state.project.months[1].style as { texture?: string }).texture = 'photo-overlay';
  assert.equal(isTextureId('photo-overlay'), false);
  assert.throws(() => validateProjectState(state), InvalidSavedProjectError);
});


test('whole-set color changes preserve per-month texture', () => {
  const state = createEmptyProject('texture-batch');
  state.project.months[1].style.texture = 'dots';
  const applied = applyColorBatch(state.project, { 1: '#B7D7F2' });
  assert.equal(applied.months[1].style.texture, 'dots');
  assert.equal(restoreColorBatch(applied).months[1].style.texture, 'dots');
});

test('saved linen selection migrates to tracing paper without changing other months', () => {
  const state = createEmptyProject('texture-legacy-linen');
  (state.project.months[1].style as { texture?: string }).texture = 'linen';
  state.project.months[2].style.texture = 'paper';
  const restored = validateProjectState(state);
  assert.equal(restored.project.months[1].style.texture, 'vellum');
  assert.equal(restored.project.months[2].style.texture, 'paper');
  assert.equal((state.project.months[1].style as { texture?: string }).texture, 'linen');
});
 

test('polka dots use white on colored backgrounds and retain a visible mark on near-white backgrounds', () => {
  for (const color of ['#C8324D', '#477B66', '#376FAE', '#B7D7F2', '#CFE8D6'] as const) {
    assert.equal(polkaDotAppearance(color).ink, '#FFFFFF');
  }
  for (const color of ['#F7F4EE', '#E6EBE8', '#F3EEA4'] as const) {
    assert.equal(polkaDotAppearance(color).ink, '#18201D');
  }
  assert.ok(polkaDotAppearance('#B7D7F2').opacity > polkaDotAppearance('#376FAE').opacity);
});
