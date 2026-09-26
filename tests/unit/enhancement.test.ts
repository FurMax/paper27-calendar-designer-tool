import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyColorBatch, restoreColorBatch } from '../../src/domain/batchColors.ts';
import { autoInk, hexToRgb } from '../../src/domain/color.ts';
import { isImportantMarkStyle, toggleImportantDay, validImportantDays } from '../../src/domain/importantDates.ts';
import { coordinatedSetColor, coordinatedSetColorChoice, recommendPhotoPalette, type PhotoPalette } from '../../src/domain/photoPalette.ts';
import { createEmptyProject } from '../../src/domain/project.ts';
import { buildMonthRenderModel } from '../../src/domain/renderModel.ts';
import { validateProjectState } from '../../src/persistence/serialization.ts';

function difference(a: string, b: string) {
  const x = hexToRgb(a as `#${string}`), y = hexToRgb(b as `#${string}`);
  return Math.sqrt(x.reduce((sum, part, i) => sum + (part - y[i]) ** 2, 0));
}
test('photo palette returns three distinct colors from a multicolor image and recalculates Auto ink', () => {
  const pixels = [
    ...Array.from({ length: 300 }, () => [216, 69, 49] as const),
    ...Array.from({ length: 150 }, () => [38, 112, 178] as const),
    ...Array.from({ length: 50 }, () => [45, 135, 82] as const),
  ];
  const result = recommendPhotoPalette(pixels);
  assert.equal(result.fallback, false);
  assert.deepEqual(result.suggestions.map(item => item.label), ['主色', '搭配色', '点缀色']);
  assert.ok(result.suggestions.every(item => item.source === 'photo'));
  assert.equal(result.suggestions[0].color, '#D84531');
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(difference(result.suggestions[i].color, result.suggestions[j].color) > 55);
  const state = createEmptyProject('palette');
  state.project.months[1].style.background = result.suggestions[2].color;
  assert.equal(buildMonthRenderModel(1, state).ink, autoInk(result.suggestions[2].color));
});
test('neutral or one-color photo uses its own pixels; empty analysis alone uses safe colors', () => {
  const state = createEmptyProject('fallback');
  const gray = recommendPhotoPalette(Array.from({ length: 400 }, () => [127, 127, 127] as const));
  assert.equal(gray.fallback, false);
  assert.equal(gray.suggestions[0].color, '#7F7F7F');
  assert.equal(gray.suggestions[0].source, 'photo');
  assert.equal(gray.suggestions[1].source, 'extension');
  assert.notEqual(gray.suggestions[0].color, gray.suggestions[1].color);
  assert.equal(recommendPhotoPalette([]).fallback, true);
  assert.equal(state.project.months[1].style.background, '#FFFFFF');
});
test('different one-color photos yield different extracted swatches', () => {
  const red = recommendPhotoPalette(Array.from({ length: 100 }, () => [210, 40, 50] as const));
  const blue = recommendPhotoPalette(Array.from({ length: 100 }, () => [30, 90, 190] as const));
  assert.equal(red.suggestions[0].color, '#D22832');
  assert.equal(blue.suggestions[0].color, '#1E5ABE');
  assert.notDeepEqual(red.suggestions.map(item => item.color), blue.suggestions.map(item => item.color));
});
test('whole-set color prefers a distinct photo swatch and only softens unsuitable tones', () => {
  const palette: PhotoPalette = { fallback: false, suggestions: [
    { label: '主色', color: '#CB5449', source: 'photo' },
    { label: '搭配色', color: '#CFAA75', source: 'photo' },
    { label: '点缀色', color: '#234D82', source: 'photo' },
  ] };
  const choice = coordinatedSetColorChoice(palette);
  assert.equal(choice.basisLabel, '搭配色');
  assert.equal(choice.basisColor, '#CFAA75');
  assert.equal(choice.color, '#CFAA75');
  assert.equal(choice.softened, false);
  const vivid = coordinatedSetColorChoice({ ...palette, suggestions: [palette.suggestions[0],
    { label: '搭配色', color: '#1B49CB', source: 'photo' },
    { label: '延展浅色', color: '#DADADA', source: 'extension' },
  ] });
  assert.equal(vivid.basisColor, '#1B49CB');
  assert.equal(vivid.softened, true);
  assert.notEqual(vivid.color, vivid.basisColor);
  const monochrome = coordinatedSetColorChoice(recommendPhotoPalette(Array.from({ length: 100 }, () => [48, 48, 48] as const)));
  assert.match(monochrome.basisLabel, /延展/);
  assert.notEqual(monochrome.color, '#303030');
  const safe = coordinatedSetColorChoice(recommendPhotoPalette([]));
  assert.equal(safe.color, '#DCE8E2');
  assert.equal(safe.basisLabel, '固定备选色');
});
test('twelve different photo palettes retain different hues in a coordinated set', () => {
  const colors = Array.from({ length: 12 }, (_, i) => {
    const hue = i * 30;
    const channels = hue < 120 ? [220, 50 + hue, 50] : hue < 240 ? [50, 220, 50 + hue - 120] : [50 + hue - 240, 50, 220];
    return coordinatedSetColor(recommendPhotoPalette(Array.from({ length: 100 }, () => channels as readonly [number, number, number])));
  });
  assert.ok(new Set(colors).size >= 5);
});
test('batch color operation stores prior values, restores once, and survives validation', () => {
  const state = createEmptyProject('batch');
  state.project.months[1].style.background = '#112233';
  const applied = applyColorBatch(state.project, { 1: '#DCE8E2', 2: '#E9D8BD' });
  assert.equal(applied.months[1].style.background, '#DCE8E2');
  assert.equal(applied.months[2].style.background, '#E9D8BD');
  assert.deepEqual(applied.colorBatchUndo, { 1: '#112233', 2: '#FFFFFF' });
  validateProjectState({ ...state, project: applied });
  const restored = restoreColorBatch(applied);
  assert.equal(restored.months[1].style.background, '#112233');
  assert.equal(restored.months[2].style.background, '#FFFFFF');
  assert.equal(restored.colorBatchUndo, undefined);
  assert.equal(restoreColorBatch(restored), restored);
});
test('project-wide mark style changes presentation without changing marked days and restores old projects', () => {
  const state = createEmptyProject('mark-style');
  state.project.months[2] = toggleImportantDay(state.project.months[2], 14);
  state.project.months[3] = toggleImportantDay(state.project.months[3], 8);
  assert.equal(state.project.importantMarkStyle, 'red');
  assert.equal(isImportantMarkStyle('circle'), true);
  assert.equal(isImportantMarkStyle('heart'), false);
  for (const style of ['circle', 'dot'] as const) {
    const project = { ...state.project, importantMarkStyle: style };
    const restored = validateProjectState({ ...state, project });
    assert.equal(buildMonthRenderModel(2, restored).importantMarkStyle, style);
    assert.equal(buildMonthRenderModel(3, restored).importantMarkStyle, style);
    assert.deepEqual(restored.project.months[2].importantDays, [14]);
    assert.deepEqual(restored.project.months[3].importantDays, [8]);
  }
  const legacy = structuredClone(state);
  delete (legacy.project as Partial<typeof legacy.project>).importantMarkStyle;
  assert.equal(validateProjectState(legacy).project.importantMarkStyle, 'red');
  const invalid = structuredClone(state);
  (invalid.project as { importantMarkStyle: string }).importantMarkStyle = 'heart';
  assert.throws(() => validateProjectState(invalid));
});
test('important dates add/remove, reject invalid days, and load from old or new projects', () => {
  const state = createEmptyProject('dates');
  assert.deepEqual(buildMonthRenderModel(2, state).importantDays, []);
  const one = toggleImportantDay(state.project.months[2], 14);
  const two = toggleImportantDay(one, 1);
  assert.deepEqual(two.importantDays, [1, 14]);
  assert.deepEqual(toggleImportantDay(two, 14).importantDays, [1]);
  assert.equal(toggleImportantDay(two, 29), two);
  assert.equal(validImportantDays(2, [1, 14]), true);
  assert.equal(validImportantDays(2, [29]), false);
  state.project.months[2] = two;
  const restored = validateProjectState(structuredClone(state));
  assert.deepEqual(buildMonthRenderModel(2, restored).importantDays, [1, 14]);
});
