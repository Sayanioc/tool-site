// Control valve sizing for incompressible fluids (liquids), IEC 60534-2-1:2011,
// turbulent, NON-CHOKED flow only. Pure functions, no DOM.
//
//   C = (Q / N1) × √( (ρ1/ρ0) / Δp )                      (IEC 60534-2-1 eq. 1)
//   N1 = 1 for Kv with Q in m³/h and Δp in bar; N1 = 0.865 for Cv (Q m³/h, Δp bar)
//   ⇒ Cv = 1.156 × Kv
//   FF = 0.96 − 0.28 √(pv / pc)                            (liquid critical pressure ratio factor)
//   Δp_choked = FL² × (p1 − FF × pv)                       (Fp = 1)
// Assumptions / limits: Fp = 1 (valve size = pipe size, no reducers), FR = 1 (fully
// turbulent; check valve Reynolds number for viscous fluids), Newtonian single-phase
// liquid, non-choked (Δp < Δp_choked). Pressures in bar ABSOLUTE.

export const N1_KV = 1;
export const N1_CV = 0.865;
export const KV_TO_CV = 1 / 0.865; // 1.156…

function num(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
  return x;
}

export function ffFactor(pv, pc) {
  num(pv, 'Vapour pressure'); num(pc, 'Critical pressure');
  if (pv < 0) throw new RangeError('Vapour pressure cannot be negative (use absolute pressure).');
  if (pc <= 0) throw new RangeError('Critical pressure must be greater than 0.');
  if (pv >= pc) throw new RangeError('Vapour pressure must be lower than the critical pressure.');
  return 0.96 - 0.28 * Math.sqrt(pv / pc);
}

/**
 * Liquid valve coefficient.
 * q: flow m³/h; p1, p2, pv, pc: bar abs; sg: ρ1/ρ0 (water at 15 °C = 1); fl: pressure recovery factor.
 * Returns { kv, cv, dp, dpChoked, ff, choked }.
 */
export function liquidCv({ q, p1, p2, sg, pv, pc = 220.64, fl = 0.9 }) {
  num(q, 'Flow'); num(p1, 'Inlet pressure'); num(p2, 'Outlet pressure'); num(sg, 'Specific gravity'); num(fl, 'FL');
  if (q <= 0) throw new RangeError('Flow must be greater than 0.');
  if (p1 <= 0 || p2 <= 0) throw new RangeError('Pressures must be absolute and greater than 0.');
  if (p2 >= p1) throw new RangeError('Outlet pressure must be lower than inlet pressure (Δp > 0).');
  if (sg <= 0 || sg > 25) throw new RangeError('Specific gravity must be greater than 0.');
  if (fl <= 0 || fl > 1) throw new RangeError('FL must be between 0 and 1 (typical 0.55–0.95).');
  const ff = ffFactor(pv, pc);
  if (pv >= p1) throw new RangeError('Vapour pressure is at or above the inlet pressure: the liquid is flashing at the inlet – not a liquid sizing case.');
  const dp = p1 - p2;
  const dpChoked = fl * fl * (p1 - ff * pv);
  const kv = (q / N1_KV) * Math.sqrt(sg / dp);
  const cv = (q / N1_CV) * Math.sqrt(sg / dp);
  return { kv, cv, dp, dpChoked, ff, choked: dp >= dpChoked, flashing: p2 < pv };
}

export const FLOW_UNITS = {
  m3h: { label: 'm³/h', toM3h: 1 },
  lmin: { label: 'L/min', toM3h: 0.06 },
  gpm: { label: 'US gpm', toM3h: 0.003785411784 * 60 },
};

export function flowToM3h(value, unit) {
  num(value, 'Flow');
  const u = FLOW_UNITS[unit];
  if (!u) throw new RangeError(`Unknown flow unit "${unit}".`);
  return value * u.toM3h;
}
