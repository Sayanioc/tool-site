import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resistance, temperature, sensitivity, tolerance } from '../js/calc/rtd.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b} (tol ${tol})`);

test('required check: Pt100 at 100 °C = 138.5055 Ω', () => {
  close(resistance(100), 138.5055, 5e-5);
});

test('IEC 60751 Pt100 reference table values (published to 0.01 Ω)', () => {
  const table = [
    [-200, 18.52], [-100, 60.26], [-50, 80.31], [0, 100], [50, 119.4],
    [100, 138.51], [200, 175.86], [300, 212.05], [400, 247.09], [500, 280.98],
    [600, 313.71], [700, 345.28], [800, 375.7], [850, 390.48],
  ];
  for (const [t, r] of table) close(resistance(t), r, 0.005 + 1e-9);
  close(resistance(-200), 18.5201, 5e-5); // 4-decimal values from the CVD equation
  close(resistance(850), 390.4811, 5e-5);
});

test('Pt1000 is 10 x Pt100', () => {
  close(resistance(100, 1000), 1385.055, 5e-4);
  close(resistance(-200, 1000), 185.201, 5e-4);
});

test('inverse: resistance -> temperature (both branches)', () => {
  close(temperature(138.5055), 100, 2e-4);
  close(temperature(100), 0, 1e-12);
  close(temperature(18.5201), -200, 2e-4);
  close(temperature(60.2558), -100, 2e-4);
  close(temperature(1385.055, 1000), 100, 2e-4);
  for (let t = -200; t <= 850; t += 0.5) close(temperature(resistance(t)), t, 1e-9);
});

test('sensitivity and tolerance classes', () => {
  close(sensitivity(0), 0.39083, 1e-12);
  close(tolerance(100, 'B'), 0.8, 1e-12);
  close(tolerance(-100, 'A'), 0.35, 1e-12);
  close(tolerance(0, 'AA'), 0.1, 1e-12);
});

test('out of range and invalid input', () => {
  assert.throws(() => resistance(-200.1), RangeError);
  assert.throws(() => resistance(851), RangeError);
  assert.throws(() => temperature(18), RangeError);
  assert.throws(() => temperature(391), RangeError);
  assert.throws(() => temperature(-5), RangeError);
  assert.throws(() => resistance(NaN), RangeError);
  assert.throws(() => resistance(20, 0), RangeError);
  assert.throws(() => tolerance(20, 'Z'), RangeError);
});
