import assert from 'node:assert/strict';
import test from 'node:test';
import { ALL_MONTHS, CALENDAR_YEAR, getCalendarMonth, MONTH_NAMES, WEEKDAY_INITIALS } from '../../src/domain/calendar.ts';
import { OUTPUT_GEOMETRY } from '../../src/domain/geometry.ts';
import { buildMonthRenderModel } from '../../src/domain/renderModel.ts';

const expectedStarts = [5, 1, 1, 4, 6, 2, 4, 0, 3, 5, 1, 3];
const expectedLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

for (const month of ALL_MONTHS) {
  test(`${MONTH_NAMES[month - 1]} 2027 uses a correct Sunday-first six-row grid`, () => {
    const data = getCalendarMonth(month);
    assert.equal(data.year, CALENDAR_YEAR);
    assert.equal(data.name, MONTH_NAMES[month - 1]);
    assert.equal(data.cells.length, 42);
    assert.equal(data.firstWeekday, expectedStarts[month - 1]);
    assert.equal(data.dayCount, expectedLengths[month - 1]);
    assert.equal(data.cells[data.firstWeekday], 1);
    assert.equal(data.cells[data.firstWeekday + data.dayCount - 1], data.dayCount);
    assert.equal(data.cells.filter(Boolean).length, data.dayCount);
    assert.deepEqual(data.cells.slice(0, data.firstWeekday), Array(data.firstWeekday).fill(null));
    assert.ok(data.cells.slice(data.firstWeekday + data.dayCount).every(cell => cell === null));
    assert.deepEqual(buildMonthRenderModel(month).calendar, data);
  });
}

test('shared geometry covers the whole output with separate photo and calendar regions', () => {
  assert.equal(OUTPUT_GEOMETRY.photo.width, OUTPUT_GEOMETRY.width);
  assert.equal(OUTPUT_GEOMETRY.photo.height, 1044);
  assert.equal(OUTPUT_GEOMETRY.calendar.y, OUTPUT_GEOMETRY.photo.height);
  assert.equal(OUTPUT_GEOMETRY.calendar.height + OUTPUT_GEOMETRY.photo.height, OUTPUT_GEOMETRY.height);
  assert.deepEqual(WEEKDAY_INITIALS, ['S', 'M', 'T', 'W', 'T', 'F', 'S']);
});
