// 4-20 mA loop power budget. Pure functions, no DOM. Ohm's law (V = I·R).
//   R_cable  = 2 × L × r / 1000            (two conductors, L in m, r in Ω/km per conductor)
//   R_total  = R_load (AI card / sense resistor) + R_barrier + R_cable + R_other
//   R_max    = (V_supply − V_min) / I_max  (maximum loop resistance the transmitter can drive)
//   V_tx     = V_supply − I_max × R_total  (terminal voltage at the highest loop current)
// I_max should include the upscale alarm current (NAMUR NE 43: ≥ 21 mA; many transmitters
// drive up to ~23 mA). HART needs a loop resistance of at least 230 Ω (250 Ω typical)
// for communication (HART FSK physical layer; max 1100 Ω).

export const HART_MIN_OHM = 230;
export const HART_MAX_OHM = 1100;

// IEC 60228 maximum DC resistance at 20 °C, class 1/2 plain annealed copper (Ω/km).
export const COPPER_OHM_PER_KM = { 0.5: 36.0, 0.75: 24.5, 1: 18.1, 1.5: 12.1, 2.5: 7.41 };

function num(x, name) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a number.`);
  return x;
}
function nonNeg(x, name) {
  num(x, name);
  if (x < 0) throw new RangeError(`${name} cannot be negative.`);
  return x;
}

export function cableResistance(lengthM, ohmPerKm) {
  nonNeg(lengthM, 'Cable length'); nonNeg(ohmPerKm, 'Conductor resistance');
  return (2 * lengthM * ohmPerKm) / 1000;
}

export function loopBudget({ vSupply, vMin, iMaxMA = 23, rLoad = 250, rBarrier = 0, rOther = 0, lengthM = 0, ohmPerKm = 0, hart = true }) {
  num(vSupply, 'Supply voltage'); num(vMin, 'Transmitter minimum voltage');
  num(iMaxMA, 'Maximum current');
  if (vSupply <= 0 || vSupply > 60) throw new RangeError('Supply voltage must be between 0 and 60 V DC.');
  if (vMin <= 0) throw new RangeError('Transmitter minimum (lift-off) voltage must be greater than 0 V.');
  if (iMaxMA < 20 || iMaxMA > 30) throw new RangeError('Maximum loop current should be 20–30 mA (include the upscale alarm current, e.g. 21–23 mA).');
  nonNeg(rLoad, 'Load resistance'); nonNeg(rBarrier, 'Barrier resistance'); nonNeg(rOther, 'Other resistance');
  const iMax = iMaxMA / 1000;
  const rCable = cableResistance(lengthM, ohmPerKm);
  const rTotal = rLoad + rBarrier + rOther + rCable;
  const rMax = (vSupply - vMin) / iMax;
  const vTx = vSupply - iMax * rTotal;
  const vTx4 = vSupply - 0.004 * rTotal;
  const warnings = [];
  if (vSupply <= vMin) warnings.push('Supply voltage is not above the transmitter minimum voltage: the loop cannot work.');
  const hartLoad = rLoad + rBarrier + rOther; // resistance seen by HART between supply and transmitter (cable excluded conservatively)
  if (hart && hartLoad < HART_MIN_OHM) warnings.push(`HART needs at least ${HART_MIN_OHM} Ω loop resistance (250 Ω typical); this loop has ${hartLoad.toFixed(1)} Ω excluding cable.`);
  if (hart && rTotal > HART_MAX_OHM) warnings.push(`Loop resistance above ${HART_MAX_OHM} Ω may prevent HART communication.`);
  return { rCable, rTotal, rMax, vTx, vTx4, ok: vTx >= vMin && vSupply > vMin, marginOhm: rMax - rTotal, warnings };
}

/** Minimum supply voltage needed for a given loop. */
export function minSupply({ vMin, iMaxMA = 23, rTotal }) {
  num(vMin, 'Transmitter minimum voltage'); num(iMaxMA, 'Maximum current'); nonNeg(rTotal, 'Loop resistance');
  return vMin + (iMaxMA / 1000) * rTotal;
}
