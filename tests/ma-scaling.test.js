import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maToPercent, percentToMa, percentToPv, pvToPercent, pvPercent, namurStatus, scalingTable, checkRange } from '../js/calc/ma-scaling.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test('mA <-> % (4-20 mA)', () => {
  close(maToPercent(4), 0);
  close(maToPercent(12), 50);
  close(maToPercent(20), 100);
  close(maToPercent(8), 25);
  close(percentToMa(75), 16);
  close(percentToMa(-1.25), 3.8);
  close(percentToMa(103.125), 20.5);
});

test('linear PV scaling, incl. elevated, suppressed and reversed ranges', () => {
  close(percentToPv(maToPercent(8), 0, 10), 2.5);
  close(percentToPv(50, -1, 4), 1.5);
  close(percentToPv(25, -5000, 0), -3750);
  close(percentToPv(25, 100, 0), 75); // reverse acting
  close(pvToPercent(2.5, 0, 10), 25);
  close(pvToPercent(75, 100, 0), 25);
});

test('square-root (DP flow) mode', () => {
  close(percentToPv(25, 0, 100, 'sqrt'), 50); // 25 % DP = 50 % flow
  close(pvToPercent(50, 0, 100, 'sqrt'), 25);
  close(percentToMa(pvToPercent(50, 0, 100, 'sqrt')), 8); // 50 % flow -> 8 mA
  close(pvPercent(50, 'sqrt'), Math.sqrt(0.5) * 100);
  close(percentToPv(maToPercent(12), 0, 200, 'sqrt'), 141.4213562373095);
  assert.throws(() => percentToPv(-1, 0, 100, 'sqrt'), RangeError);
  assert.throws(() => pvToPercent(-1, 0, 100, 'sqrt'), RangeError);
});

test('table', () => {
  const lin = scalingTable(0, 10);
  assert.deepEqual(lin.map((r) => r.mA), [4, 8, 12, 16, 20]);
  assert.deepEqual(lin.map((r) => r.pv), [0, 2.5, 5, 7.5, 10]);
  const sq = scalingTable(0, 100, 'sqrt');
  assert.deepEqual(sq.map((r) => r.signalPct), [0, 6.25, 25, 56.25, 100]);
  assert.deepEqual(sq.map((r) => r.mA), [4, 5, 8, 13, 20]);
});

test('custom signal 1-5 V / 0-20 mA', () => {
  close(percentToMa(50, 1, 5), 3);
  close(maToPercent(10, 0, 20), 50);
});

test('NAMUR NE 43 status', () => {
  assert.equal(namurStatus(12).level, 'ok');
  assert.equal(namurStatus(3.9).level, 'info');
  assert.equal(namurStatus(3.7).level, 'warn');
  assert.equal(namurStatus(3.6).level, 'fault');
  assert.equal(namurStatus(20.7).level, 'warn');
  assert.equal(namurStatus(21).level, 'fault');
});

test('invalid input', () => {
  assert.throws(() => checkRange(5, 5), RangeError);
  assert.throws(() => maToPercent(NaN), RangeError);
  assert.throws(() => maToPercent('12'), RangeError);
  assert.throws(() => maToPercent(12, 20, 4), RangeError);
  assert.throws(() => percentToPv(50, 0, 10, 'log'), RangeError);
  assert.throws(() => percentToPv(50, 0, Infinity), RangeError);
});
