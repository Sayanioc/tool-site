// Platinum RTD (Pt100, Pt1000, any R0) per IEC 60751:2022 (Callendar-Van Dusen).
// -200 °C <= t < 0 °C : R(t) = R0 [1 + A t + B t² + C (t − 100) t³]
//    0 °C <= t <= 850 °C: R(t) = R0 [1 + A t + B t²]
// A = 3.9083e-3 /°C, B = -5.775e-7 /°C², C = -4.183e-12 /°C⁴  (α = 0.00385 /°C)

export const A = 3.9083e-3;
export const B = -5.775e-7;
export const C = -4.183e-12;
export const T_MIN = -200;
export const T_MAX = 850;

function req(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
}
function checkR0(r0) {
  req(r0, 'R0');
  if (r0 <= 0) throw new RangeError('R0 must be greater than 0 Ω (100 for Pt100, 1000 for Pt1000).');
}

function ratio(t) {
  return t < 0 ? 1 + A * t + B * t * t + C * (t - 100) * t * t * t : 1 + A * t + B * t * t;
}

/** Temperature (°C, ITS-90) -> resistance (Ω). */
export function resistance(t, r0 = 100) {
  req(t, 'Temperature');
  checkR0(r0);
  if (t < T_MIN || t > T_MAX) throw new RangeError(`Temperature ${t} °C is outside the IEC 60751 range (${T_MIN} to ${T_MAX} °C).`);
  return r0 * ratio(t);
}

/** Resistance (Ω) -> temperature (°C). Exact inverse of resistance() (closed form ≥ 0 °C, Newton < 0 °C). */
export function temperature(r, r0 = 100) {
  req(r, 'Resistance');
  checkR0(r0);
  const w = r / r0;
  const wMin = ratio(T_MIN), wMax = ratio(T_MAX);
  if (w < wMin - 1e-12 || w > wMax + 1e-12) {
    throw new RangeError(`Resistance ${r} Ω is outside the IEC 60751 range for R0 = ${r0} Ω (${(r0 * wMin).toFixed(4)} to ${(r0 * wMax).toFixed(4)} Ω, i.e. ${T_MIN} to ${T_MAX} °C).`);
  }
  // Quadratic solution (exact for t >= 0, a starting guess below 0).
  let t = (-A + Math.sqrt(A * A - 4 * B * (1 - w))) / (2 * B);
  if (w >= 1) return t;
  for (let i = 0; i < 50; i++) {
    const f = ratio(t) - w;
    const d = A + 2 * B * t + C * (4 * t * t * t - 300 * t * t);
    const dt = f / d;
    t -= dt;
    if (Math.abs(dt) < 1e-12) break;
  }
  return t;
}

/** Sensitivity dR/dt (Ω/°C) at temperature t. */
export function sensitivity(t, r0 = 100) {
  resistance(t, r0);
  return r0 * (t < 0 ? A + 2 * B * t + C * (4 * t ** 3 - 300 * t * t) : A + 2 * B * t);
}

/** IEC 60751 tolerance classes: ±(a + b|t|) °C. */
export const CLASSES = {
  AA: { a: 0.1, b: 0.0017 },
  A: { a: 0.15, b: 0.002 },
  B: { a: 0.3, b: 0.005 },
  C: { a: 0.6, b: 0.01 },
};

export function tolerance(t, cls = 'B') {
  req(t, 'Temperature');
  const k = CLASSES[cls];
  if (!k) throw new RangeError(`Unknown tolerance class "${cls}".`);
  return k.a + k.b * Math.abs(t);
}
