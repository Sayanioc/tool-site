# CLAUDE.md — conventions for this repo

Static I&C calculator site (working name **LoopCalc**). Read PLAN.md and PROGRESS.md first.

## Tech rules
- Plain HTML, CSS, vanilla JS ES modules. **No frameworks, no build step, no external
  CDNs, fonts or trackers.** Must run on GitHub Pages from the repo root.
- Base URL: `https://sayanioc.github.io/tool-site/` — used only in canonical tags,
  JSON-LD, sitemap.xml, robots.txt and 404.html. Change it everywhere with
  `node tools/set-base-url.mjs <new-base-url>`.
- All math in **pure functions under `/js/calc/`** (no DOM), one module per calculator.
  Invalid / out-of-range input -> `throw new RangeError('clear message')`.
- Shared `/css/style.css` and `/js/ui.js`. A new calculator = one `<slug>/index.html`
  (inline `<script type="module">` glue) + one `js/calc/<name>.js` + one test file,
  then add it to `index.html`, `sitemap.xml` and PROGRESS.md.
- Never delete, rename or modify google5a4ac238096a586b.html (Google Search Console verification).
  `tools/check-links.mjs` fails if it is missing or changed; `tools/set-base-url.mjs` skips it.
- Keep the empty `.nojekyll` at the repo root so GitHub Pages serves files as-is (no Jekyll build).
- Pages live in `<slug>/index.html` and use relative paths (`../css/style.css`).

## Accuracy (non-negotiable)
- Standard formulas only; cite the standard on each page.
- RTD: IEC 60751 Callendar-Van Dusen, A=3.9083e-3, B=-5.775e-7, C=-4.183e-12 (C only below 0 °C).
- Thermocouples: NIST ITS-90 reference functions (NIST Monograph 175 / SRD 60).
- Must always pass: Pt100 @100 °C = 138.5055 Ω; Type K @100 °C = 4.096 mV (0 °C ref).
- Never guess a coefficient. If unsure, write it in PROGRESS.md "Open questions".

## Tests
- `node --test` (Node 20+), zero dependencies. Every calculator: published reference
  values, edge cases, invalid input.
- `node tools/check-links.mjs` — broken links, sitemap, canonical check.
- Run both before every commit; update PROGRESS.md before every commit.

## Every calculator page must have
- Instant results on input, both directions where sensible; SI + °C defaults; Indian
  plant units (kg/cm²) supported.
- Inputs mirrored in query string (shareable), copy-result and copy-link buttons.
- Below the tool: what it does, formula, worked example, common mistakes, standard.
- Unique `<title>`, meta description, exactly one `<h1>`, canonical, JSON-LD WebApplication.
- Accessible: `<label for>` on every input, keyboard friendly, contrast AA, works at 360 px.
- Disclaimer (footer): reference tool only; verify against datasheets and site
  standards before safety-critical use.

## Git
- Develop on the assigned branch; commit + push after every milestone.
- Check time before each milestone: `TZ=Asia/Kolkata date`.
