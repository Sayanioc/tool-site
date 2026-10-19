# PROGRESS

_Last updated: 2026-10-19 (IST). A fresh session should read PLAN.md + CLAUDE.md, then this file._

## Name
Working name: **LoopCalc** ("loop" = the 4-20 mA loop every I&C person works on).
Alternatives: **InstruCalc**, **TagCalc**, **FieldCal Tools**.

## Milestones
| # | Milestone | Status |
|---|-----------|--------|
| 1 | Site shell: home, nav, footer disclaimer, responsive, 404, sitemap, robots, favicon | Done |
| 2 | 4-20 mA scaling (`/4-20ma-calculator/`) | Done – tests + browser smoke test at 360 px |
| 3 | Pressure units (`/pressure-unit-converter/`) | Done – tests + browser smoke test |
| 4 | RTD Pt100/Pt1000 | Not started |
| 5 | Thermocouples | Not started |
| 6 | DP level range | Not started |
| 7 | Calibration sheet | Not started |
| 8 | (stretch) Control valve Cv/Kv liquid | Not started |

## Verified
- `node tools/check-links.mjs` passes (links, sitemap, canonical, one H1).

## Next steps
- Continue milestone order above. When a calculator page is added, replace its
  `<!--x-->…<!--/x-->` "coming soon" card in index.html with a link card.

## Open questions
1. **Base URL vs repo name.** You asked for `https://sayanioc.github.io/tool_site/`, but the
   GitHub repo is `Sayanioc/tool-site` (hyphen). GitHub Pages serves a project site at
   `https://sayanioc.github.io/tool-site/` unless the repo is renamed to `tool_site`.
   The site uses `tool_site` as requested; if you keep the repo name, run
   `node tools/set-base-url.mjs https://sayanioc.github.io/tool-site/` (one command).
