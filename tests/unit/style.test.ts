import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_MONTHS } from '../../src/domain/calendar.ts';
import { autoInk, canonicalHex, contrastRatio, customContrastWarning, hexToRgb, rgbToHex } from '../../src/domain/color.ts';
import { createEmptyProject } from '../../src/domain/project.ts';
import { buildMonthRenderModel } from '../../src/domain/renderModel.ts';
import { expectedFontFamilies, SCALE_MULTIPLIERS, TYPOGRAPHY_PRESETS } from '../../src/domain/typography.ts';

test('HEX and RGB inputs canonicalize and reject invalid channels', () => {
  assert.equal(canonicalHex(' #abc '), '#AABBCC');
  assert.equal(canonicalHex('ff80a0'), '#FF80A0');
  assert.equal(canonicalHex('#12345g'), null);
  assert.equal(rgbToHex(255, 128, 0), '#FF8000');
  assert.equal(rgbToHex(256, 0, 0), null);
  assert.deepEqual(hexToRgb('#FF8000'), [255, 128, 0]);
});

test('auto ink chooses higher contrast and custom warning never overrides choice', () => {
  for (const background of ['#FFFFFF', '#000000', '#777777', '#3457D5'] as const) {
    const ink = autoInk(background);
    const other = ink === '#FFFFFF' ? '#18201D' : '#FFFFFF';
    assert.ok(contrastRatio(background, ink) >= contrastRatio(background, other));
  }
  assert.equal(customContrastWarning('#FFFFFF', '#FFFFFF'), true);
  assert.equal(customContrastWarning('#FFFFFF', '#18201D'), false);
});

test('all twelve render models share the project typography and each month retains its colors', () => {
  const state = createEmptyProject('test');
  state.project.typography = { presetId: 'handwritten', scale: 'large' };
  state.project.months[2].style = { background: '#112233', text: { mode: 'custom', color: '#445566' } };
  for (const month of ALL_MONTHS) {
    const model = buildMonthRenderModel(month, state);
    assert.equal(model.typography.id, 'handwritten');
    assert.equal(model.scale, SCALE_MULTIPLIERS.large);
    assert.equal(model.calendar.cells.length, 42);
    assert.equal(model.ink, month === 2 ? '#445566' : autoInk('#FFFFFF'));
  }
  assert.equal(buildMonthRenderModel(2, state).customContrastWarning, true);
});

test('three bounded presets have explicit bundled font families and distinct month faces', () => {
  assert.deepEqual(Object.keys(TYPOGRAPHY_PRESETS), ['classic', 'minimal', 'handwritten']);
  assert.deepEqual(Object.keys(SCALE_MULTIPLIERS), ['small', 'standard', 'large']);
  assert.deepEqual(expectedFontFamilies('classic'), ['Instrument Serif', 'Instrument Sans']);
  assert.deepEqual(expectedFontFamilies('minimal'), ['Instrument Sans']);
  assert.deepEqual(expectedFontFamilies('handwritten'), ['Patrick Hand']);
});
