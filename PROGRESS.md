# PROGRESS

_Last updated: 2026-10-19 ~20:20 IST. A fresh session should read PLAN.md + CLAUDE.md, then this file._

## Name
Working name: **LoopCalc** ("loop" = the 4-20 mA loop every I&C person works on).
Alternatives: **InstruCalc**, **TagCalc**, **FieldCal Tools**.

## Status
| # | Milestone | URL | Status |
|---|-----------|-----|--------|
| 1 | Site shell: home, nav, footer disclaimer, responsive, 404, sitemap, robots, favicon | `/` | Done |
| 2 | 4-20 mA scaling, linear + square root, 0/25/50/75/100 % table, NAMUR NE 43 | `/4-20ma-calculator/` | Done |
| 3 | Pressure units (14 units incl. kg/cm², mmH₂O, inH₂O, mmHg) + gauge/absolute | `/pressure-unit-converter/` | Done |
| 4 | RTD Pt100/Pt1000/any R0, °C ↔ Ω, IEC 60751 CVD, class tolerances, table | `/rtd-pt100-calculator/` | Done |
| 5 | Thermocouples K J T E N R S B, °C ↔ mV, cold-junction compensation | `/thermocouple-calculator/` | Done |
| 6 | DP level LRV/URV: open tank/dry leg, wet leg, remote seals, step-by-step | `/dp-level-calculator/` | Done |
| 7 | Calibration sheet: 5-point as-found/as-left, error % span, pass/fail, print | `/calibration-sheet/` | Done |
| 8 | (stretch) Control valve liquid Cv/Kv, IEC 60534-2-1 non-choked + choked/flashing check | `/control-valve-cv-calculator/` | Done |
| 9 | (extra) Loop power budget: max loop resistance, terminal voltage, cable/barrier, HART 230 Ω | `/loop-power-calculator/` | Done |
| 10 | (extra) Temperature converter °C/°F/K/°R + difference mode | `/temperature-converter/` | Done |

Every calculator page has: instant two-way results, query-string sharing, copy-result and
copy-link buttons, what-it-does / formula / worked example / common mistakes / standard
sections, unique title + meta description, one H1, canonical, JSON-LD WebApplication,
labelled inputs, footer disclaimer.

## Verified
- `node --test`: **52 tests pass** (9 files in `tests/`).
  - Required checks: **Pt100 @ 100 °C = 138.5055 Ω** ✔, **Type K @ 100 °C = 4.096 mV** ✔.
  - RTD: IEC 60751 table values −200…850 °C (0.01 Ω), round-trip °C→Ω→°C < 1e-9 °C every 0.5 °C.
  - Thermocouples: NIST ITS-90 table values for all 8 types (±0.6 µV), piece continuity at
    sub-range boundaries, inverse round-trip < 1e-6 °C across each range, CJC.
  - Pressure: NIST SP 811 factors, every unit round-trips with every other, gauge/abs.
  - Control valve: IEC 60534-2-1 Annex D liquid example (Kv ≈ 165, FF = 0.944) ✔.
  - DP level: textbook dry-leg, wet-leg and seal cases; seal result independent of transmitter elevation.
- `node tools/check-links.mjs`: no broken links/imports, sitemap ↔ pages, canonical = location,
  one H1, title + meta description present, inline scripts parse (`node --check`), JSON-LD parses.
- Browser smoke test (Playwright/Chromium, 360 px): every page loads with no console errors,
  no horizontal page scroll; results appear for default and query-string inputs.
- Lighthouse 12 (local server, mobile): **100 / 100 / 100 / 100** (performance, accessibility,
  best practices, SEO) on all calculator pages + homepage (temperature converter: smoke-tested only).
- Calibration sheet prints on one A4 page (checked via Chromium PDF).

## How the thermocouple coefficients were sourced (please read)
NIST's site (srdata.nist.gov) was blocked from this environment. The direct-function
coefficients were therefore generated programmatically (no hand-typing) from
`source_NIST.py` of the public-domain PyPI package `thermocouples_reference` 0.20, which is
generated from NIST SRD 60. They were then verified independently against NIST table values
for all 8 types (see tests). The inverse (mV → °C) is **not** the NIST inverse polynomial:
it is a numerical inversion (bisection) of the direct reference function, which is exact
to < 1e-6 °C, whereas the NIST inverse polynomials have fitting errors up to ±0.06 °C.
Recommended follow-up: diff `js/calc/thermocouple.js` coefficients against
https://srdata.nist.gov/its90/download/allcoeff.tab from a machine with access.

## Open questions
1. **Base URL vs repo name.** You asked for `https://sayanioc.github.io/tool_site/`, but the
   GitHub repo is `Sayanioc/tool-site` (hyphen). GitHub Pages serves a project site at
   `https://sayanioc.github.io/tool-site/` unless the repo is renamed to `tool_site`.
   The site uses `tool_site` as requested. If you keep the repo name, run
   `node tools/set-base-url.mjs https://sayanioc.github.io/tool-site/` (one command, then
   re-run the checks). Otherwise canonical URLs and the 404 page will point to the wrong path.
2. **inH₂O reference.** The converter uses the conventional inch of water (ρ = 1000 kg/m³,
   249.08891 Pa). Some transmitters use water at 68 °F (248.64 Pa) or 60 °F (248.84 Pa).
   This is stated on the page; a selectable reference could be added.
3. **Type B mV → °C** is limited to ≥ 50 °C (the function is non-monotonic below ~21 °C).
   NIST's own inverse covers 250–1820 °C only.
4. **Control valve**: only Fp = 1, FR = 1 (turbulent), non-choked. Choked flow is detected
   and refused rather than sized. The "> 80 % of Δp_choked → incipient cavitation may occur"
   warning is a rule-of-thumb, not an IEC requirement.
5. **Loop power**: HART minimum 230 Ω / maximum 1100 Ω and IEC 60228 copper resistances
   (0.5–2.5 mm²) are from memory of the HART physical-layer spec and IEC 60228; please
   spot-check against your copies.
6. **NAMUR NE 43 boundaries**: ≤ 3.6 mA and ≥ 21.0 mA are treated as failure; 3.6–3.8 and
   20.5–21.0 mA as under/over-range warnings.

## Next steps (suggested priority)
1. Decide the base URL (open question 1), enable GitHub Pages, submit sitemap in Search Console.
2. Merge the branch to `main` (Pages deploys from the default branch root).
3. New calculators (high search demand for I&C): orifice plate flow (ISO 5167-2), RTD lead-wire
   error, flow unit converter, PID tuning helper, SIL/PFDavg helper.
4. Optional: selectable inH₂O reference; °F display on temperature tools; hysteresis
   (downscale) points on the calibration sheet; Open Graph images.

## Dev notes
- Local server: `python3 -m http.server 8000` (ES modules don't load from `file://`).
- Homepage cards are wrapped in `<!--key-->…<!--/key-->` markers to make scripted edits easy.
- `ui.js` helpers: `readNum`, `fmt`, `fmtSigned`, `fmtSig`, `restoreFromQuery`, `writeQuery`,
  `radioValue`, `setFieldError` (needs `<p class="err" id="<id>-err">`), `setMsg`,
  `setupCopyButtons` (needs `#copy-result`, `#copy-link`, `#copy-status`), `onAnyInput`.
