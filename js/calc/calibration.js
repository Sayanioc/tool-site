// Calibration sheet math for analogue (4-20 mA) transmitters. Pure functions, no DOM.
// Expected output (linear):      mA = lo + (hi − lo) × p
// Expected output (square root): mA = lo + (hi − lo) × √p      (p = input fraction of span)
// Error (% of span) = (measured − expected) / (hi − lo) × 100
// A point passes when |error| ≤ tolerance (% of span).

const EPS = 1e-9; // guards against binary rounding at the exact tolerance limit

function num(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
  return x;
}

export const DEFAULT_POINTS = [0, 25, 50, 75, 100];

export function expectedOutput(pct, { lo = 4, hi = 20, mode = 'linear' } = {}) {
  num(pct, 'Test point');
  num(lo, 'Output low'); num(hi, 'Output high');
  if (!(hi > lo)) throw new RangeError('Output high must be greater than output low.');
  if (mode !== 'linear' && mode !== 'sqrt') throw new RangeError('Mode must be linear or sqrt.');
  if (pct < 0 || pct > 100) throw new RangeError('Test points must be between 0 and 100 % of span.');
  const f = mode === 'sqrt' ? Math.sqrt(pct / 100) : pct / 100;
  return lo + (hi - lo) * f;
}

export function errorPercentOfSpan(measured, expected, lo = 4, hi = 20) {
  num(measured, 'Measured value'); num(expected, 'Expected value');
  return ((measured - expected) / (hi - lo)) * 100;
}

export function isPass(errPct, tolerance) {
  return Math.abs(errPct) <= tolerance + EPS;
}

/**
 * Build a calibration sheet.
 * asFound / asLeft: arrays of measured outputs (NaN / null = not entered).
 * Returns { rows, asFound: summary, asLeft: summary } where summary =
 * { entered, maxAbsErr, pass } (pass = null when nothing entered; false if any point fails).
 */
export function calibrationSheet({ lrv, urv, tolerance, points = DEFAULT_POINTS, asFound = [], asLeft = [], lo = 4, hi = 20, mode = 'linear' }) {
  num(lrv, 'LRV'); num(urv, 'URV'); num(tolerance, 'Tolerance');
  if (lrv === urv) throw new RangeError('LRV and URV must be different.');
  if (tolerance <= 0) throw new RangeError('Tolerance must be greater than 0 % of span.');
  if (!Array.isArray(points) || points.length === 0) throw new RangeError('At least one test point is required.');
  const has = (v) => typeof v === 'number' && Number.isFinite(v);
  const rows = points.map((pct, i) => {
    const expected = expectedOutput(pct, { lo, hi, mode });
    const input = lrv + (urv - lrv) * (pct / 100);
    const row = { pct, input, expected };
    for (const [key, arr] of [['asFound', asFound], ['asLeft', asLeft]]) {
      const m = arr[i];
      if (has(m)) {
        const err = errorPercentOfSpan(m, expected, lo, hi);
        row[key] = { measured: m, err, pass: isPass(err, tolerance) };
      } else row[key] = null;
    }
    return row;
  });
  const summarize = (key) => {
    const done = rows.filter((r) => r[key]);
    if (!done.length) return { entered: 0, maxAbsErr: null, pass: null };
    return { entered: done.length, maxAbsErr: Math.max(...done.map((r) => Math.abs(r[key].err))), pass: done.every((r) => r[key].pass) };
  };
  return { rows, asFound: summarize('asFound'), asLeft: summarize('asLeft') };
}
