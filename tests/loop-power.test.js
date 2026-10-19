import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loopBudget, cableResistance, minSupply, COPPER_OHM_PER_KM } from '../js/calc/loop-power.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test('max loop resistance matches the common "43.5 × (V − 10.5)" datasheet rule (23 mA)', () => {
  const r = loopBudget({ vSupply: 24, vMin: 10.5, iMaxMA: 23, rLoad: 250 });
  close(r.rMax, 13.5 / 0.023);
  close(r.rMax, 43.478 * 13.5, 0.01);
});

test('cable resistance, two conductors', () => {
  close(cableResistance(500, 18.1), 18.1); // 2 × 500 m × 18.1 Ω/km
  close(cableResistance(1000, COPPER_OHM_PER_KM[1.5]), 24.2);
});

test('budget: 24 V, 250 Ω card, 10 Ω barrier-free, 1 km of 1.5 mm² cable', () => {
  const r = loopBudget({ vSupply: 24, vMin: 10.5, iMaxMA: 23, rLoad: 250, lengthM: 1000, ohmPerKm: 12.1 });
  close(r.rTotal, 274.2);
  close(r.vTx, 24 - 0.023 * 274.2);
  assert.equal(r.ok, true);
  close(r.marginOhm, 13.5 / 0.023 - 274.2);
  assert.equal(r.warnings.length, 0);
});

test('fails when the barrier eats the voltage; HART warnings', () => {
  const r = loopBudget({ vSupply: 24, vMin: 12, iMaxMA: 22, rLoad: 250, rBarrier: 340 });
  assert.equal(r.ok, false);
  const h = loopBudget({ vSupply: 24, vMin: 10.5, rLoad: 100 });
  assert.ok(h.warnings.some((w) => /230/.test(w)));
  const noHart = loopBudget({ vSupply: 24, vMin: 10.5, rLoad: 100, hart: false });
  assert.equal(noHart.warnings.length, 0);
});

test('minimum supply voltage', () => {
  close(minSupply({ vMin: 10.5, iMaxMA: 23, rTotal: 300 }), 17.4);
});

test('invalid input', () => {
  assert.throws(() => loopBudget({ vSupply: 0, vMin: 10 }), RangeError);
  assert.throws(() => loopBudget({ vSupply: 24, vMin: 0 }), RangeError);
  assert.throws(() => loopBudget({ vSupply: 24, vMin: 10, iMaxMA: 12 }), RangeError);
  assert.throws(() => loopBudget({ vSupply: 24, vMin: 10, rLoad: -1 }), RangeError);
  assert.throws(() => cableResistance(-5, 12), RangeError);
  assert.throws(() => loopBudget({ vSupply: NaN, vMin: 10 }), RangeError);
});
