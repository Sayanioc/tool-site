import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertTemperature as ct, T_UNITS } from '../js/calc/temperature.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test('fixed points', () => {
  close(ct(0, 'C', 'F'), 32);
  close(ct(100, 'C', 'F'), 212);
  close(ct(-40, 'C', 'F'), -40);
  close(ct(0, 'C', 'K'), 273.15);
  close(ct(0, 'K', 'C'), -273.15);
  close(ct(0, 'K', 'F'), -459.67);
  close(ct(491.67, 'R', 'C'), 0);
  close(ct(37, 'C', 'F'), 98.6);
});

test('round trips between all units', () => {
  for (const a of Object.keys(T_UNITS)) for (const b of Object.keys(T_UNITS)) close(ct(ct(523.4, a, b), b, a), 523.4, 1e-9);
});

test('difference mode (spans and tolerances)', () => {
  close(ct(100, 'C', 'F', true), 180);
  close(ct(1, 'F', 'C', true), 5 / 9);
  close(ct(10, 'K', 'C', true), 10);
  close(ct(-5, 'C', 'R', true), -9); // negative differences allowed
});

test('invalid input', () => {
  assert.throws(() => ct(-300, 'C', 'F'), RangeError);
  assert.throws(() => ct(-1, 'K', 'C'), RangeError);
  assert.throws(() => ct(-460, 'F', 'C'), RangeError);
  assert.throws(() => ct(10, 'C', 'X'), RangeError);
  assert.throws(() => ct(NaN, 'C', 'F'), RangeError);
});
