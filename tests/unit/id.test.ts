import assert from 'node:assert/strict';
import test from 'node:test';
import { newId } from '../../src/domain/id.ts';

test('UUID generation works when randomUUID is absent on HTTP LAN', () => {
  let next = 0;
  const id = newId({ getRandomValues(bytes) { bytes.forEach((_, index) => { bytes[index] = next++; }); return bytes; } });
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(id, '00010203-0405-4607-8809-0a0b0c0d0e0f');
});

test('UUID generation uses native randomUUID when available', () => {
  assert.equal(newId({ randomUUID: () => 'native-id', getRandomValues() { throw new Error('not needed'); } }), 'native-id');
});
