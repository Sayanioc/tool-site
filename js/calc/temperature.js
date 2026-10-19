// Temperature unit conversion (exact definitions, ITS-90 / SI Brochure).
// K = °C + 273.15;  °F = °C × 9/5 + 32;  °R = K × 9/5
// Difference mode (spans, errors, tolerances): Δ°C = ΔK, Δ°F = Δ°R = 1.8 × Δ°C.

export const T_UNITS = {
  C: { label: '°C', name: 'degree Celsius' },
  F: { label: '°F', name: 'degree Fahrenheit' },
  K: { label: 'K', name: 'kelvin' },
  R: { label: '°R', name: 'degree Rankine' },
};

function num(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
  return x;
}

function toKelvin(v, u) {
  switch (u) {
    case 'C': return v + 273.15;
    case 'F': return (v - 32) * (5 / 9) + 273.15;
    case 'K': return v;
    case 'R': return v * (5 / 9);
    default: throw new RangeError(`Unknown temperature unit "${u}".`);
  }
}

function fromKelvin(k, u) {
  switch (u) {
    case 'C': return k - 273.15;
    case 'F': return (k - 273.15) * (9 / 5) + 32;
    case 'K': return k;
    case 'R': return k * (9 / 5);
    default: throw new RangeError(`Unknown temperature unit "${u}".`);
  }
}

/** Convert a temperature (difference = false) or a temperature difference (difference = true). */
export function convertTemperature(value, from, to, difference = false) {
  num(value, 'Temperature');
  if (!T_UNITS[from] || !T_UNITS[to]) throw new RangeError(`Unknown temperature unit "${T_UNITS[from] ? to : from}".`);
  if (difference) {
    const perK = { C: 1, K: 1, F: 1.8, R: 1.8 };
    return (value / perK[from]) * perK[to];
  }
  const k = toKelvin(value, from);
  if (k < -1e-9) throw new RangeError(`${value} ${T_UNITS[from].label} is below absolute zero (0 K = −273.15 °C = −459.67 °F).`);
  return fromKelvin(Math.max(k, 0), to);
}
