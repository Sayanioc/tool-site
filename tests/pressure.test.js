import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, toPa, fromPa, gaugeAbs, UNITS } from '../js/calc/pressure.js';

const rel = (a, b, r = 1e-9) => assert.ok(Math.abs(a - b) <= Math.abs(b) * r, `${a} !~ ${b}`);

test('factors to Pa (NIST SP 811 / conventional)', () => {
  rel(toPa(1, 'psi'), 6894.757293168361);
  rel(toPa(1, 'kgcm2'), 98066.5);
  rel(toPa(1, 'mmH2O'), 9.80665);
  rel(toPa(1, 'inH2O'), 249.08891);
  rel(toPa(1, 'mmHg'), 133.322387415);
  rel(toPa(1, 'inHg'), 3386.388640341);
  rel(toPa(1, 'atm'), 101325);
  rel(toPa(1, 'torr'), 133.32236842105263);
});

test('common plant conversions', () => {
  rel(convert(1, 'bar', 'psi'), 14.503773773020923);
  rel(convert(1, 'kgcm2', 'bar'), 0.980665);
  rel(convert(1, 'kgcm2', 'psi'), 14.223343307119563);
  rel(convert(1, 'atm', 'psi'), 14.695948775513449);
  rel(convert(1, 'bar', 'mmH2O'), 10197.162129779283);
  rel(convert(10, 'mH2O', 'bar'), 0.980665);
  rel(convert(100, 'kPa', 'mbar'), 1000);
  rel(convert(1, 'MPa', 'kgcm2'), 10.197162129779283);
  rel(convert(760, 'torr', 'atm'), 1);
  rel(fromPa(toPa(123.456, 'inH2O'), 'inH2O'), 123.456);
});

test('every unit round-trips through every other unit', () => {
  for (const a of Object.keys(UNITS)) for (const b of Object.keys(UNITS)) rel(convert(convert(7.5, a, b), b, a), 7.5, 1e-12);
});

test('gauge <-> absolute', () => {
  const r = gaugeAbs(1, 'bar', 'gauge');
  rel(r.absPa, 201325);
  rel(r.gaugePa, 1e5);
  const v = gaugeAbs(0, 'bar', 'abs');
  rel(v.gaugePa, -101325);
  const local = gaugeAbs(5, 'kgcm2', 'gauge', 95000); // site at altitude
  rel(local.absPa, 5 * 98066.5 + 95000);
  assert.throws(() => gaugeAbs(-2, 'bar', 'gauge'), RangeError); // below vacuum
  assert.throws(() => gaugeAbs(-1, 'bar', 'abs'), RangeError);
  assert.throws(() => gaugeAbs(1, 'bar', 'gauge', 0), RangeError);
  assert.throws(() => gaugeAbs(1, 'bar', 'diff'), RangeError);
});

test('invalid input', () => {
  assert.throws(() => convert(1, 'bar', 'furlong'), RangeError);
  assert.throws(() => convert(NaN, 'bar', 'psi'), RangeError);
  assert.throws(() => convert('1', 'bar', 'psi'), RangeError);
});
