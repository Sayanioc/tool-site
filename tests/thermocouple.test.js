import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emf, temperature, measuredEmf, hotJunctionTemperature, seebeck, TYPES } from '../js/calc/thermocouple.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b} (tol ${tol})`);

test('required check: type K at 100 °C = 4.096 mV (0 °C reference)', () => {
  close(emf(100, 'K'), 4.096, 0.0005);
});

// NIST ITS-90 table values (mV, 0 °C reference, rounded to 1 µV).
const NIST = {
  K: [[-270, -6.458], [-200, -5.891], [-100, -3.554], [100, 4.096], [200, 8.138], [500, 20.644], [1000, 41.276], [1372, 54.886]],
  J: [[-210, -8.095], [-200, -7.890], [100, 5.269], [500, 27.393], [1000, 57.953], [1200, 69.553]],
  T: [[-270, -6.258], [-200, -5.603], [-100, -3.379], [100, 4.279], [200, 9.288], [400, 20.872]],
  E: [[-270, -9.835], [-200, -8.825], [100, 6.319], [500, 37.005], [1000, 76.373]],
  N: [[-270, -4.345], [-200, -3.990], [100, 2.774], [1000, 36.256], [1300, 47.513]],
  R: [[-50, -0.226], [100, 0.647], [1000, 10.506], [1768.1, 21.103]],
  S: [[-50, -0.236], [100, 0.646], [1000, 9.587], [1768.1, 18.693]],
  B: [[100, 0.033], [250, 0.291], [500, 1.242], [1000, 4.834], [1820, 13.820]],
};

test('direct functions match NIST tables for all 8 types', () => {
  for (const [type, rows] of Object.entries(NIST)) for (const [t, e] of rows) close(emf(t, type), e, 0.0006);
  assert.equal(emf(0, 'K'), 0);
});

test('pieces are continuous at their boundaries', () => {
  for (const [type, d] of Object.entries(TYPES)) {
    for (let i = 0; i < d.pieces.length - 1; i++) {
      const b = d.pieces[i].max;
      close(emf(b - 1e-9, type), emf(b + 1e-9, type), 1e-5);
    }
  }
});

test('inverse matches NIST tables and round-trips', () => {
  close(temperature(4.096, 'K'), 100, 0.02);
  close(temperature(41.276, 'K'), 1000, 0.02);
  close(temperature(57.953, 'J'), 1000, 0.02);
  close(temperature(9.587, 'S'), 1000, 0.1);
  close(temperature(4.834, 'B'), 1000, 0.1);
  for (const [type, d] of Object.entries(TYPES)) {
    for (let t = d.invMin; t <= d.max; t += 7.3) close(temperature(emf(t, type), type), t, 1e-6);
  }
});

test('cold-junction compensation', () => {
  // Type K, hot 100 °C, terminals at 25 °C: meter reads E(100) − E(25)
  close(measuredEmf(100, 25, 'K'), 4.096 - 1.000, 0.001);
  close(hotJunctionTemperature(measuredEmf(350, 30, 'J'), 30, 'J'), 350, 1e-6);
  close(hotJunctionTemperature(3.096, 0, 'K'), temperature(3.096, 'K'), 1e-12);
});

test('Seebeck coefficient (type K ~41 µV/°C at 100 °C)', () => {
  close(seebeck(100, 'K'), 41.4, 0.3);
  close(seebeck(0, 'K'), 39.45, 0.05);
});

test('out of range and invalid input', () => {
  assert.throws(() => emf(1373, 'K'), RangeError);
  assert.throws(() => emf(-271, 'K'), RangeError);
  assert.throws(() => emf(1201, 'J'), RangeError);
  assert.throws(() => emf(401, 'T'), RangeError);
  assert.throws(() => emf(-51, 'S'), RangeError);
  assert.throws(() => emf(-1, 'B'), RangeError);
  assert.throws(() => temperature(60, 'K'), RangeError);
  assert.throws(() => temperature(0.001, 'B'), RangeError); // below 50 °C: ambiguous for B
  assert.throws(() => emf(100, 'X'), RangeError);
  assert.throws(() => emf(NaN, 'K'), RangeError);
  assert.throws(() => hotJunctionTemperature(1, 2000, 'K'), RangeError);
});
