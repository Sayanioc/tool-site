# PLAN — LoopCalc (working name)

Free, fast, accurate calculators for instrumentation & control (I&C) engineers and
technicians in refineries and process plants. Static site, GitHub Pages, no build step.

## Architecture

```
/                          repo root = site root (GitHub Pages)
├── index.html             homepage: calculators grouped by category
├── 404.html               not-found page (absolute asset paths, see tools/set-base-url.mjs)
├── css/style.css          the only stylesheet (light + dark, print styles)
├── js/ui.js               shared DOM helpers: number parsing/formatting, URL query sync,
│                          copy-result / copy-link buttons, inline error messages
├── js/calc/<name>.js      PURE math modules, one per calculator, no DOM access
├── <slug>/index.html      one page per calculator -> pretty URL /<slug>/
│                          (page glue lives in an inline <script type="module">)
├── tests/<name>.test.js   node --test, zero dependencies, reference values + edge cases
├── tools/check-links.mjs  local broken-link / sitemap / canonical checker
├── tools/set-base-url.mjs rewrites the base URL everywhere (custom domain move)
├── sitemap.xml, robots.txt, favicon.svg
└── PLAN.md, CLAUDE.md, PROGRESS.md, README.md
```

Principles
- Math is separated from UI so it can be unit-tested in Node against published
  reference tables (IEC 60751, NIST ITS-90 / IEC 60584-1, IEC 60534-2-1).
- Calc functions throw `RangeError` with a human-readable message for invalid or
  out-of-range input; pages catch it and show it next to the field.
- Every input is mirrored in the query string -> every result is a shareable URL.
- No frameworks, fonts, CDNs, analytics or trackers. Target Lighthouse 95+.

## Page list (slug -> calculator)

| # | Slug | Calculator | Category |
|---|------|------------|----------|
| 1 | `/` | Homepage | – |
| 2 | `/4-20ma-calculator/` | 4-20 mA scaling, linear + square-root | Signals & loop |
| 3 | `/pressure-unit-converter/` | Pressure units incl. kg/cm², mmH2O, gauge/abs | Pressure |
| 4 | `/rtd-pt100-calculator/` | Pt100/Pt1000 °C <-> Ω (IEC 60751 CVD) | Temperature |
| 5 | `/thermocouple-calculator/` | K J T E N R S B, °C <-> mV, CJC (NIST ITS-90) | Temperature |
| 6 | `/dp-level-calculator/` | DP level LRV/URV, dry leg / wet leg / remote seals | Level |
| 7 | `/calibration-sheet/` | 5-point as-found/as-left sheet, printable | Signals & loop |
| 8 | `/control-valve-cv-calculator/` | Liquid Cv/Kv per IEC 60534-2-1 (non-choked) | Flow & valves |

Future ideas: orifice plate (ISO 5167), RTD lead-wire error, mA loop load / power
supply budget, HART loop resistance, flow unit converter, temperature unit converter,
PID tuning (Ziegler-Nichols / lambda), SIL / PFDavg (IEC 61511) helper, gas Cv.

## Milestone order (commit + push after each)

1. Site shell (home, nav, footer disclaimer, responsive, 404, sitemap, robots, favicon)
2. 4-20 mA scaling
3. Pressure unit converter
4. RTD Pt100/Pt1000
5. Thermocouples
6. DP level transmitter range
7. Calibration sheet generator
8. (stretch) Control valve liquid sizing, IEC 60534-2-1 non-choked
