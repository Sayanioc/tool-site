// 4-20 mA signal scaling. Pure functions, no DOM.
// Linear:      signal% = (PV - LRV) / (URV - LRV) * 100
// Square root: transmitter output is linear in DP; flow ∝ √DP, so
//              flow fraction = √(signal fraction)  (DP flow, e.g. orifice plate, ISO 5167)
// mA = lo + (hi - lo) * signal% / 100   (lo/hi default 4 / 20 mA)
// NAMUR NE 43 signal levels: measuring range 3.8–20.5 mA, failure ≤ 3.6 or ≥ 21.0 mA.

export const MODES = ['linear', 'sqrt'];

function req(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
}

export function checkRange(lrv, urv) {
  req(lrv, 'LRV');
  req(urv, 'URV');
  if (lrv === urv) throw new RangeError('LRV and URV must be different (span cannot be zero).');
}

export function checkSignal(lo = 4, hi = 20) {
  req(lo, 'Signal low');
  req(hi, 'Signal high');
  if (!(hi > lo)) throw new RangeError('Signal high must be greater than signal low.');
}

function checkMode(mode) {
  if (!MODES.includes(mode)) throw new RangeError(`Unknown mode "${mode}" (use linear or sqrt).`);
}

/** mA -> % of signal span. */
export function maToPercent(mA, lo = 4, hi = 20) {
  req(mA, 'Current');
  checkSignal(lo, hi);
  return ((mA - lo) / (hi - lo)) * 100;
}

/** % of signal span -> mA. */
export function percentToMa(pct, lo = 4, hi = 20) {
  req(pct, 'Percent');
  checkSignal(lo, hi);
  return lo + ((hi - lo) * pct) / 100;
}

/** % of signal span -> process value. In sqrt mode the signal is DP and PV is flow. */
export function percentToPv(pct, lrv, urv, mode = 'linear') {
  req(pct, 'Percent');
  checkRange(lrv, urv);
  checkMode(mode);
  let f = pct / 100;
  if (mode === 'sqrt') {
    if (f < 0) throw new RangeError('Signal below 0 % means negative DP: square root is undefined (a DCS normally clamps this to zero flow).');
    f = Math.sqrt(f);
  }
  return lrv + f * (urv - lrv);
}

/** Process value -> % of signal span. */
export function pvToPercent(pv, lrv, urv, mode = 'linear') {
  req(pv, 'Process value');
  checkRange(lrv, urv);
  checkMode(mode);
  const f = (pv - lrv) / (urv - lrv);
  if (mode === 'sqrt') {
    if (f < 0) throw new RangeError('Flow below the LRV is not possible in square-root mode.');
    return f * f * 100;
  }
  return f * 100;
}

/** Flow % of span from signal % (sqrt mode); identity in linear mode. */
export function pvPercent(signalPct, mode = 'linear') {
  req(signalPct, 'Percent');
  checkMode(mode);
  if (mode === 'linear') return signalPct;
  if (signalPct < 0) throw new RangeError('Negative DP: square root undefined.');
  return Math.sqrt(signalPct / 100) * 100;
}

/** NAMUR NE 43 status for a 4-20 mA signal. */
export function namurStatus(mA) {
  req(mA, 'Current');
  if (mA <= 3.6) return { level: 'fault', text: 'NAMUR NE 43: ≤ 3.6 mA indicates a transmitter FAILURE (downscale alarm).' };
  if (mA < 3.8) return { level: 'warn', text: 'Below the NAMUR NE 43 measuring range (3.8–20.5 mA): under-range.' };
  if (mA >= 21) return { level: 'fault', text: 'NAMUR NE 43: ≥ 21.0 mA indicates a transmitter FAILURE (upscale alarm).' };
  if (mA > 20.5) return { level: 'warn', text: 'Above the NAMUR NE 43 measuring range (3.8–20.5 mA): over-range.' };
  if (mA < 4 || mA > 20) return { level: 'info', text: 'Outside 4–20 mA but inside the NAMUR NE 43 saturation band (3.8–20.5 mA).' };
  return { level: 'ok', text: '' };
}

/**
 * Check-point table. Points are % of PV span (flow % in sqrt mode).
 * Returns rows { pvPct, signalPct, mA, pv }.
 */
export function scalingTable(lrv, urv, mode = 'linear', lo = 4, hi = 20, points = [0, 25, 50, 75, 100]) {
  checkRange(lrv, urv);
  checkSignal(lo, hi);
  checkMode(mode);
  return points.map((p) => {
    const signalPct = mode === 'sqrt' ? (p / 100) ** 2 * 100 : p;
    return { pvPct: p, signalPct, mA: percentToMa(signalPct, lo, hi), pv: lrv + (p / 100) * (urv - lrv) };
  });
}
