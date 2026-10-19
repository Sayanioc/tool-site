import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liquidCv, ffFactor, flowToM3h, KV_TO_CV } from '../js/calc/control-valve.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b} (tol ${tol})`);

test('IEC 60534-2-1 Annex D example (water 90 °C, globe valve, non-choked): Kv ≈ 165', () => {
  // ρ1 = 965.4 kg/m³, pv = 70.1 kPa, pc = 22 120 kPa, p1 = 680 kPa, p2 = 220 kPa, Q = 360 m³/h, FL = 0.90
  const r = liquidCv({ q: 360, p1: 6.8, p2: 2.2, sg: 0.9654, pv: 0.701, pc: 221.2, fl: 0.9 });
  close(r.ff, 0.944, 0.0005);
  close(r.dpChoked, 4.97, 0.01);
  assert.equal(r.choked, false);
  close(r.kv, 165, 0.5);
  close(r.cv, r.kv * 1.156, 0.1);
});

test('classic US form: Cv = gpm × √(SG/Δp psi)', () => {
  // 100 gpm water, Δp 25 psi -> Cv = 20
  const psi = 0.0689475729; // bar
  const r = liquidCv({ q: flowToM3h(100, 'gpm'), p1: 1 + 50 * psi, p2: 1 + 25 * psi, sg: 1, pv: 0.0317, fl: 0.9 });
  close(r.cv, 20, 0.001);
  close(KV_TO_CV, 1.156, 0.0005);
});

test('Kv definition: 1 m³/h water at 1 bar Δp -> Kv = 1', () => {
  close(liquidCv({ q: 1, p1: 3, p2: 2, sg: 1, pv: 0.03 }).kv, 1, 1e-12);
});

test('choked and flashing detection', () => {
  const r = liquidCv({ q: 50, p1: 10, p2: 1.5, sg: 1, pv: 0.5, fl: 0.6 });
  assert.equal(r.choked, true); // Δp 8.5 > 0.36 × (10 − FF·0.5)
  const f = liquidCv({ q: 50, p1: 10, p2: 0.4, sg: 1, pv: 0.5, fl: 0.9 });
  assert.equal(f.flashing, true);
  close(ffFactor(0, 220.64), 0.96, 1e-12);
});

test('invalid input', () => {
  assert.throws(() => liquidCv({ q: 10, p1: 5, p2: 5, sg: 1, pv: 0.03 }), RangeError);
  assert.throws(() => liquidCv({ q: 10, p1: 5, p2: 6, sg: 1, pv: 0.03 }), RangeError);
  assert.throws(() => liquidCv({ q: 0, p1: 5, p2: 4, sg: 1, pv: 0.03 }), RangeError);
  assert.throws(() => liquidCv({ q: 10, p1: 5, p2: 4, sg: 1, pv: 6 }), RangeError);
  assert.throws(() => liquidCv({ q: 10, p1: 5, p2: 4, sg: 1, pv: 0.03, fl: 1.2 }), RangeError);
  assert.throws(() => liquidCv({ q: 10, p1: 5, p2: 4, sg: -1, pv: 0.03 }), RangeError);
  assert.throws(() => flowToM3h(10, 'bbl'), RangeError);
});
