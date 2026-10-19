// Thermocouple EMF per the NIST ITS-90 thermocouple reference functions
// (NIST Monograph 175 / NIST SRD 60; identical to IEC 60584-1:2013).
// E(t) = Σ c_i·t^i  [+ a0·exp(a1·(t − a2)²) for type K above 0 °C]; t in °C, E in mV,
// reference junction at 0 °C.
// Coefficients generated from NIST SRD 60 data (via the public-domain
// `thermocouples_reference` package, source_NIST.py) and verified in tests against
// NIST table values.
// Inverse (mV -> °C) is solved numerically from the reference function itself (bisection
// to < 1e-9 °C) rather than with the NIST inverse polynomials, which carry a fitting error
// of up to ±0.06 °C; the result is the exact inverse of the reference function.

export const TYPES = {
  K: {
    name: "Nickel-Chromium / Nickel-Aluminium (Chromel/Alumel)", min: -270, max: 1372, invMin: -270,
    pieces: [
      { min: -270.0, max: 0.0, c: [0.0, 0.039450128025, 2.3622373598e-05, -3.2858906784e-07, -4.9904828777e-09, -6.7509059173e-11, -5.7410327428e-13, -3.1088872894e-15, -1.0451609365e-17, -1.9889266878e-20, -1.6322697486e-23] },
      { min: 0.0, max: 1372.0, c: [-0.017600413686, 0.038921204975, 1.8558770032e-05, -9.9457592874e-08, 3.1840945719e-10, -5.6072844889e-13, 5.6075059059e-16, -3.2020720003e-19, 9.7151147152e-23, -1.2104721275e-26], exp: [0.1185976, -0.0001183432, 126.9686] },
    ],
  },
  J: {
    name: "Iron / Copper-Nickel (Iron/Constantan)", min: -210, max: 1200, invMin: -210,
    pieces: [
      { min: -210.0, max: 760.0, c: [0.0, 0.050381187815, 3.047583693e-05, -8.568106572e-08, 1.3228195295e-10, -1.7052958337e-13, 2.0948090697e-16, -1.2538395336e-19, 1.5631725697e-23] },
      { min: 760.0, max: 1200.0, c: [296.45625681, -1.4976127786, 0.0031787103924, -3.1847686701e-06, 1.5720819004e-09, -3.0691369056e-13] },
    ],
  },
  T: {
    name: "Copper / Copper-Nickel (Copper/Constantan)", min: -270, max: 400, invMin: -270,
    pieces: [
      { min: -270.0, max: 0.0, c: [0.0, 0.038748106364, 4.4194434347e-05, 1.1844323105e-07, 2.0032973554e-08, 9.0138019559e-10, 2.2651156593e-11, 3.6071154205e-13, 3.8493939883e-15, 2.8213521925e-17, 1.4251594779e-19, 4.8768662286e-22, 1.079553927e-24, 1.3945027062e-27, 7.9795153927e-31] },
      { min: 0.0, max: 400.0, c: [0.0, 0.038748106364, 3.329222788e-05, 2.0618243404e-07, -2.1882256846e-09, 1.0996880928e-11, -3.0815758772e-14, 4.547913529e-17, -2.7512901673e-20] },
    ],
  },
  E: {
    name: "Nickel-Chromium / Copper-Nickel (Chromel/Constantan)", min: -270, max: 1000, invMin: -270,
    pieces: [
      { min: -270.0, max: 0.0, c: [0.0, 0.058665508708, 4.5410977124e-05, -7.7998048686e-07, -2.5800160843e-08, -5.9452583057e-10, -9.3214058667e-12, -1.0287605534e-13, -8.0370123621e-16, -4.3979497391e-18, -1.6414776355e-20, -3.9673619516e-23, -5.5827328721e-26, -3.4657842013e-29] },
      { min: 0.0, max: 1000.0, c: [0.0, 0.05866550871, 4.5032275582e-05, 2.8908407212e-08, -3.3056896652e-10, 6.502440327e-13, -1.9197495504e-16, -1.2536600497e-18, 2.1489217569e-21, -1.4388041782e-24, 3.5960899481e-28] },
    ],
  },
  N: {
    name: "Nicrosil / Nisil", min: -270, max: 1300, invMin: -270,
    pieces: [
      { min: -270.0, max: 0.0, c: [0.0, 0.026159105962, 1.0957484228e-05, -9.3841111554e-08, -4.6412039759e-11, -2.6303357716e-12, -2.2653438003e-14, -7.6089300791e-17, -9.3419667835e-20] },
      { min: 0.0, max: 1300.0, c: [0.0, 0.025929394601, 1.571014188e-05, 4.3825627237e-08, -2.5261169794e-10, 6.4311819339e-13, -1.0063471519e-15, 9.9745338992e-19, -6.0863245607e-22, 2.0849229339e-25, -3.0682196151e-29] },
    ],
  },
  R: {
    name: "Platinum-13% Rhodium / Platinum", min: -50, max: 1768.1, invMin: -50,
    pieces: [
      { min: -50.0, max: 1064.18, c: [0.0, 0.00528961729765, 1.39166589782e-05, -2.38855693017e-08, 3.56916001063e-11, -4.62347666298e-14, 5.00777441034e-17, -3.73105886191e-20, 1.57716482367e-23, -2.81038625251e-27] },
      { min: 1064.18, max: 1664.5, c: [2.95157925316, -0.00252061251332, 1.59564501865e-05, -7.64085947576e-09, 2.05305291024e-12, -2.93359668173e-16] },
      { min: 1664.5, max: 1768.1, c: [152.232118209, -0.268819888545, 0.000171280280471, -3.45895706453e-08, -9.34633971046e-15] },
    ],
  },
  S: {
    name: "Platinum-10% Rhodium / Platinum", min: -50, max: 1768.1, invMin: -50,
    pieces: [
      { min: -50.0, max: 1064.18, c: [0.0, 0.00540313308631, 1.2593428974e-05, -2.32477968689e-08, 3.22028823036e-11, -3.31465196389e-14, 2.55744251786e-17, -1.25068871393e-20, 2.71443176145e-24] },
      { min: 1064.18, max: 1664.5, c: [1.32900444085, 0.00334509311344, 6.54805192818e-06, -1.64856259209e-09, 1.29989605174e-14] },
      { min: 1664.5, max: 1768.1, c: [146.628232636, -0.258430516752, 0.000163693574641, -3.30439046987e-08, -9.43223690612e-15] },
    ],
  },
  B: {
    name: "Platinum-30% Rhodium / Platinum-6% Rhodium", min: 0, max: 1820, invMin: 50,
    pieces: [
      { min: 0.0, max: 630.615, c: [0.0, -0.00024650818346, 5.9040421171e-06, -1.3257931636e-09, 1.5668291901e-12, -1.694452924e-15, 6.2990347094e-19] },
      { min: 630.615, max: 1820.0, c: [-3.8938168621, 0.02857174747, -8.4885104785e-05, 1.5785280164e-07, -1.6835344864e-10, 1.1109794013e-13, -4.4515431033e-17, 9.8975640821e-21, -9.3791330289e-25] },
    ],
  },
};

function req(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
}
function getType(type) {
  const d = TYPES[type];
  if (!d) throw new RangeError(`Unknown thermocouple type "${type}" (use K, J, T, E, N, R, S or B).`);
  return d;
}

function evalRef(d, t) {
  // Pieces share boundaries; the lower piece is used at a shared boundary (values agree).
  const p = d.pieces.find((q) => t <= q.max) || d.pieces[d.pieces.length - 1];
  let e = 0;
  for (let i = p.c.length - 1; i >= 0; i--) e = e * t + p.c[i];
  if (p.exp) e += p.exp[0] * Math.exp(p.exp[1] * (t - p.exp[2]) ** 2);
  return e;
}

/** EMF in mV for hot junction t (°C) with the reference junction at 0 °C. */
export function emf(t, type) {
  req(t, 'Temperature');
  const d = getType(type);
  if (t < d.min || t > d.max) throw new RangeError(`Temperature ${t} °C is outside the type ${type} range (${d.min} to ${d.max} °C).`);
  return evalRef(d, t);
}

/** Temperature (°C) for an EMF in mV referenced to 0 °C. */
export function temperature(mV, type) {
  req(mV, 'EMF');
  const d = getType(type);
  let lo = d.invMin, hi = d.max;
  const eLo = evalRef(d, lo), eHi = evalRef(d, hi);
  if (mV < eLo - 5e-7 || mV > eHi + 5e-7) {
    throw new RangeError(`EMF ${mV} mV is outside the type ${type} range (${eLo.toFixed(3)} to ${eHi.toFixed(3)} mV, i.e. ${lo} to ${hi} °C, 0 °C reference).`);
  }
  if (mV <= eLo) return lo;
  if (mV >= eHi) return hi;
  for (let i = 0; i < 200 && hi - lo > 1e-10; i++) {
    const mid = (lo + hi) / 2;
    if (evalRef(d, mid) < mV) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Seebeck coefficient dE/dt in µV/°C at t (numerical derivative). */
export function seebeck(t, type) {
  const d = getType(type);
  emf(t, type);
  const h = 0.01;
  const a = Math.max(d.min, t - h), b = Math.min(d.max, t + h);
  return ((evalRef(d, b) - evalRef(d, a)) / (b - a)) * 1000;
}

/** Voltage a meter reads at the terminals: E(t_hot) − E(t_cold). */
export function measuredEmf(tHot, tCold, type) {
  return emf(tHot, type) - emf(tCold, type);
}

/** Hot-junction temperature from the terminal voltage, with cold-junction compensation. */
export function hotJunctionTemperature(mVmeasured, tCold, type) {
  req(mVmeasured, 'EMF');
  return temperature(mVmeasured + emf(tCold, type), type);
}
