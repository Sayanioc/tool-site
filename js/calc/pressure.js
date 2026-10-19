// Pressure unit conversion. Pure functions, no DOM.
// Factors to pascal (Pa). Sources: BIPM SI Brochure, NIST SP 811 (2008) Appendix B,
// ISO 80000-4. Water/mercury columns use conventional values (ρ_water = 1000 kg/m³,
// ρ_Hg = 13 595.1 kg/m³, g_n = 9.806 65 m/s²).

const G_N = 9.80665; // standard gravity, m/s² (exact, CGPM 1901)
const LBF = 4.4482216152605; // pound-force in newtons (exact)
const INCH = 0.0254; // m (exact)

export const UNITS = {
  Pa: { label: 'Pa', name: 'pascal', toPa: 1 },
  kPa: { label: 'kPa', name: 'kilopascal', toPa: 1e3 },
  MPa: { label: 'MPa', name: 'megapascal', toPa: 1e6 },
  bar: { label: 'bar', name: 'bar', toPa: 1e5 },
  mbar: { label: 'mbar', name: 'millibar', toPa: 100 },
  psi: { label: 'psi', name: 'pound-force per square inch', toPa: LBF / (INCH * INCH) },
  kgcm2: { label: 'kg/cm²', name: 'kilogram-force per square centimetre', toPa: G_N * 1e4 },
  mmH2O: { label: 'mmH₂O', name: 'millimetre of water (conventional)', toPa: G_N },
  mH2O: { label: 'mH₂O', name: 'metre of water (conventional)', toPa: G_N * 1e3 },
  inH2O: { label: 'inH₂O', name: 'inch of water (conventional)', toPa: G_N * 25.4 },
  mmHg: { label: 'mmHg', name: 'millimetre of mercury (conventional)', toPa: 13.5951 * G_N * 1 },
  inHg: { label: 'inHg', name: 'inch of mercury (conventional)', toPa: 13.5951 * G_N * 25.4 },
  torr: { label: 'Torr', name: 'torr (1/760 atm)', toPa: 101325 / 760 },
  atm: { label: 'atm', name: 'standard atmosphere', toPa: 101325 },
};

export const STD_ATM_PA = 101325;

function req(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
}
function unit(u) {
  const d = UNITS[u];
  if (!d) throw new RangeError(`Unknown pressure unit "${u}".`);
  return d;
}

export function toPa(value, from) {
  req(value, 'Pressure');
  return value * unit(from).toPa;
}

export function fromPa(pa, to) {
  req(pa, 'Pressure');
  return pa / unit(to).toPa;
}

/** Convert a value between any two units (same reference: gauge->gauge or abs->abs). */
export function convert(value, from, to) {
  return fromPa(toPa(value, from), to);
}

/**
 * Gauge <-> absolute. patmPa = local atmospheric pressure in Pa (default 101 325).
 * Returns { gaugePa, absPa }. Throws if absolute pressure would be negative.
 */
export function gaugeAbs(value, from, reference = 'gauge', patmPa = STD_ATM_PA) {
  req(patmPa, 'Atmospheric pressure');
  if (patmPa <= 0 || patmPa > 2e5) throw new RangeError('Atmospheric pressure must be between 0 and 200 kPa (absolute).');
  if (reference !== 'gauge' && reference !== 'abs') throw new RangeError('Reference must be "gauge" or "abs".');
  const pa = toPa(value, from);
  const absPa = reference === 'abs' ? pa : pa + patmPa;
  if (absPa < -1e-9) throw new RangeError('Absolute pressure cannot be negative (below perfect vacuum). Check the value and gauge/absolute selection.');
  return { absPa, gaugePa: absPa - patmPa };
}
