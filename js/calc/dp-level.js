// DP level transmitter range (LRV/URV) by hydrostatics: P = ρ·g·h, expressed as head of
// water: P[mmH2O] = SG × h[mm] (SG relative to water at the same reference density).
// Datum: HP tap (or HP seal diaphragm). Vapour-space density is neglected.
//
//   HP side   = SG_liq × L + SG_hpLeg × e
//   LP side   = 0                         (open tank / dry leg)
//             = SG_wet  × (d + e)         (wet leg)
//             = SG_fill × (d + e)         (remote seals, capillaries filled with SG_fill)
//   DP        = HP − LP;  LRV = DP at L = h0,  URV = DP at L = h0 + H
// L  = liquid level above the HP tap, h0 = 0 % level above the HP tap, H = level span,
// e  = transmitter elevation BELOW the HP tap/seal (negative if above),
// d  = vertical distance from HP tap to LP tap (wet leg / seals).
// SG_hpLeg = SG_liq for impulse lines full of process liquid, SG_fill for remote seals.

export const CONFIGS = ['dry', 'wet', 'seals'];

function num(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
  return x;
}
function sg(x, name) {
  num(x, name);
  if (x <= 0 || x > 25) throw new RangeError(`${name} must be greater than 0 and realistic (≤ 25).`);
  return x;
}
const r = (x) => Math.round(x * 1000) / 1000;

export function dpLevelRange({ config = 'dry', sgLiquid, h0 = 0, span, e = 0, d = 0, sgWet = 1, sgFill = 1 }) {
  if (!CONFIGS.includes(config)) throw new RangeError(`Unknown configuration "${config}".`);
  sg(sgLiquid, 'Process liquid SG');
  num(h0, 'Zero level height');
  num(span, 'Level span');
  num(e, 'Transmitter elevation');
  if (h0 < 0) throw new RangeError('The 0 % level cannot be below the HP tap – the transmitter cannot measure below its HP connection.');
  if (span <= 0) throw new RangeError('Level span must be greater than 0.');
  const warnings = [];
  const steps = [];
  const hpLegSG = config === 'seals' ? sg(sgFill, 'Fill fluid SG') : sgLiquid;
  if (config !== 'dry') {
    num(d, 'Tap distance');
    if (d <= 0) throw new RangeError('Distance between HP and LP taps must be greater than 0.');
    if (h0 + span > d + 1e-9) warnings.push('The 100 % level is above the LP tap: the LP connection would be flooded. Check h0, span and tap distance.');
  }
  if (config === 'wet') sg(sgWet, 'Wet leg SG');

  const hpLeg = hpLegSG * e;
  const hp0 = sgLiquid * h0 + hpLeg;
  const hp100 = sgLiquid * (h0 + span) + hpLeg;
  let lp = 0;
  const legName = config === 'seals' ? 'capillary fill fluid' : 'process liquid in the HP impulse line';
  steps.push(`HP leg head = SG × e = ${hpLegSG} × ${e} = ${r(hpLeg)} mmH₂O (${legName})`);
  steps.push(`HP at 0 % = SG_liquid × h0 + HP leg = ${sgLiquid} × ${h0} + ${r(hpLeg)} = ${r(hp0)} mmH₂O`);
  steps.push(`HP at 100 % = SG_liquid × (h0 + H) + HP leg = ${sgLiquid} × ${r(h0 + span)} + ${r(hpLeg)} = ${r(hp100)} mmH₂O`);
  if (config === 'dry') {
    steps.push('LP side = 0 (vented to atmosphere or dry reference leg; vapour density neglected)');
  } else {
    const s = config === 'wet' ? sgWet : sgFill;
    lp = s * (d + e);
    steps.push(`LP side = SG_${config === 'wet' ? 'wet leg' : 'fill'} × (d + e) = ${s} × ${r(d + e)} = ${r(lp)} mmH₂O`);
  }
  const lrv = hp0 - lp;
  const urv = hp100 - lp;
  steps.push(`LRV = HP(0 %) − LP = ${r(hp0)} − ${r(lp)} = ${r(lrv)} mmH₂O`);
  steps.push(`URV = HP(100 %) − LP = ${r(hp100)} − ${r(lp)} = ${r(urv)} mmH₂O`);
  steps.push(`Calibrated span = URV − LRV = SG_liquid × H = ${r(urv - lrv)} mmH₂O`);
  if (config === 'seals' && e < 0) warnings.push('Transmitter above the HP seal: check the seal system vacuum limit and fill-fluid vapour pressure.');
  if (config === 'dry' && e < 0) warnings.push('Transmitter above the HP tap with a liquid-filled impulse line: gas pockets will cause errors. Mount below the tap or use seals.');
  const kind = lrv < 0 ? 'elevated zero (LRV below zero)' : lrv > 0 ? 'suppressed zero (LRV above zero)' : 'no zero shift';
  return { lrv, urv, span: urv - lrv, lp, hp0, hp100, kind, steps, warnings };
}

/** Level (in the same height unit) from a measured DP (mmH2O) for a given ranging. */
export function levelFromDp(dpMmH2O, opts) {
  num(dpMmH2O, 'DP');
  const res = dpLevelRange(opts);
  return (opts.h0 ?? 0) + ((dpMmH2O - res.lrv) / res.span) * opts.span;
}
