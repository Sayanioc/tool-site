import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expectedOutput, errorPercentOfSpan, isPass, calibrationSheet } from '../js/calc/calibration.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test('expected mA at 5 points (linear and square root)', () => {
  assert.deepEqual([0, 25, 50, 75, 100].map((p) => expectedOutput(p)), [4, 8, 12, 16, 20]);
  close(expectedOutput(25, { mode: 'sqrt' }), 12);
  close(expectedOutput(50, { lo: 1, hi: 5 }), 3);
});

test('error % of span and pass/fail at the exact limit', () => {
  close(errorPercentOfSpan(12.08, 12), 0.5);
  close(errorPercentOfSpan(3.96, 4), -0.25);
  assert.equal(isPass(errorPercentOfSpan(12.08, 12), 0.5), true); // exactly on limit passes
  assert.equal(isPass(errorPercentOfSpan(12.081, 12), 0.5), false);
});

test('sheet with as-found fail and as-left pass', () => {
  const s = calibrationSheet({
    lrv: 0, urv: 10, tolerance: 0.5,
    asFound: [4.02, 8.05, 12.1, 16.12, 20.2],
    asLeft: [4.0, 8.01, 12.0, 15.99, 20.01],
  });
  assert.deepEqual(s.rows.map((r) => r.input), [0, 2.5, 5, 7.5, 10]);
  assert.equal(s.asFound.pass, false);
  close(s.asFound.maxAbsErr, 1.25);
  assert.equal(s.rows[0].asFound.pass, true);
  assert.equal(s.rows[4].asFound.pass, false);
  assert.equal(s.asLeft.pass, true);
  close(s.asLeft.maxAbsErr, 0.0625);
});

test('partially entered and empty readings', () => {
  const s = calibrationSheet({ lrv: -100, urv: 100, tolerance: 1, asFound: [4, NaN, null, undefined, 20.1] });
  assert.equal(s.asFound.entered, 2);
  assert.equal(s.asFound.pass, true);
  assert.equal(s.asLeft.pass, null);
  assert.equal(s.rows[1].asFound, null);
  assert.deepEqual(s.rows.map((r) => r.input), [-100, -50, 0, 50, 100]);
});

test('invalid input', () => {
  assert.throws(() => calibrationSheet({ lrv: 0, urv: 0, tolerance: 0.5 }), RangeError);
  assert.throws(() => calibrationSheet({ lrv: 0, urv: 10, tolerance: 0 }), RangeError);
  assert.throws(() => calibrationSheet({ lrv: 0, urv: 10, tolerance: 0.5, points: [] }), RangeError);
  assert.throws(() => expectedOutput(110), RangeError);
  assert.throws(() => expectedOutput(50, { lo: 20, hi: 4 }), RangeError);
  assert.throws(() => expectedOutput(50, { mode: 'log' }), RangeError);
});
