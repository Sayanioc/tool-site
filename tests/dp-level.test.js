import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dpLevelRange, levelFromDp } from '../js/calc/dp-level.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test('open tank, transmitter at tap level: 0 to SG×H', () => {
  const r = dpLevelRange({ config: 'dry', sgLiquid: 1, h0: 0, span: 5000 });
  close(r.lrv, 0); close(r.urv, 5000); assert.equal(r.kind, 'no zero shift');
});

test('open tank, transmitter below tap (suppressed zero)', () => {
  const r = dpLevelRange({ config: 'dry', sgLiquid: 0.8, h0: 500, span: 3000, e: 1000 });
  close(r.lrv, 1200); close(r.urv, 3600); close(r.span, 2400);
  assert.match(r.kind, /suppressed/);
});

test('classic wet leg, water both sides: -H to 0', () => {
  const r = dpLevelRange({ config: 'wet', sgLiquid: 1, h0: 0, span: 5000, d: 5000, sgWet: 1 });
  close(r.lrv, -5000); close(r.urv, 0);
  assert.match(r.kind, /elevated/);
});

test('wet leg, different SGs, transmitter below HP tap', () => {
  const r = dpLevelRange({ config: 'wet', sgLiquid: 0.8, h0: 500, span: 5000, d: 6000, e: 1000, sgWet: 1.0 });
  close(r.lrv, -5800); close(r.urv, -1800); close(r.span, 4000);
});

test('remote seals: result independent of transmitter elevation', () => {
  const a = dpLevelRange({ config: 'seals', sgLiquid: 1, h0: 0, span: 5000, d: 5000, e: 1000, sgFill: 0.934 });
  close(a.lrv, -4670, 1e-9); close(a.urv, 330, 1e-9);
  const b = dpLevelRange({ config: 'seals', sgLiquid: 1, h0: 0, span: 5000, d: 5000, e: 0, sgFill: 0.934 });
  close(b.lrv, a.lrv, 1e-9); close(b.urv, a.urv, 1e-9);
  const c = dpLevelRange({ config: 'seals', sgLiquid: 1, h0: 0, span: 5000, d: 5000, e: -2000, sgFill: 0.934 });
  close(c.lrv, a.lrv, 1e-9);
  assert.ok(c.warnings.length > 0);
});

test('level from DP', () => {
  const o = { config: 'wet', sgLiquid: 1, h0: 0, span: 5000, d: 5000, sgWet: 1 };
  close(levelFromDp(-2500, o), 2500);
});

test('warnings and invalid input', () => {
  const r = dpLevelRange({ config: 'wet', sgLiquid: 1, h0: 0, span: 6000, d: 5000 });
  assert.ok(r.warnings.some((w) => /flooded/.test(w)));
  assert.throws(() => dpLevelRange({ config: 'dry', sgLiquid: 0, span: 1000 }), RangeError);
  assert.throws(() => dpLevelRange({ config: 'dry', sgLiquid: 1, span: 0 }), RangeError);
  assert.throws(() => dpLevelRange({ config: 'dry', sgLiquid: 1, span: 1000, h0: -1 }), RangeError);
  assert.throws(() => dpLevelRange({ config: 'wet', sgLiquid: 1, span: 1000, d: 0 }), RangeError);
  assert.throws(() => dpLevelRange({ config: 'seals', sgLiquid: 1, span: 1000, d: 2000, sgFill: NaN }), RangeError);
  assert.throws(() => dpLevelRange({ config: 'bubbler', sgLiquid: 1, span: 1000 }), RangeError);
});
