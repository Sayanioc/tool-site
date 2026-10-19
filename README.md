# LoopCalc — free instrumentation & control calculators

LoopCalc (working name) is a free, fast, static website of calculators for
instrumentation & control (I&C) engineers and technicians in refineries and process
plants: 4-20 mA scaling, pressure units (incl. kg/cm²), Pt100/Pt1000 RTDs (IEC 60751),
thermocouples (NIST ITS-90), DP level transmitter ranging, calibration sheets, loop
power budget and control valve Cv/Kv (IEC 60534-2-1, liquids).

- Plain HTML + CSS + vanilla JavaScript ES modules. No frameworks, no build step,
  no external CDNs, fonts, analytics or trackers.
- All math lives in pure, unit-tested modules in `js/calc/`.
- Live site (planned): https://sayanioc.github.io/tool_site/

## Run locally

ES modules need an HTTP server (not `file://`):

```sh
python3 -m http.server 8000      # then open http://localhost:8000/
```

## Tests and checks

Requires Node.js 20+ and nothing else (zero dependencies):

```sh
node --test                      # all calculator tests (tests/*.test.js)
node tools/check-links.mjs       # broken links, sitemap, canonical, one <h1> per page
```

## Add a calculator

1. `js/calc/<name>.js` — pure functions, no DOM. Throw `RangeError('clear message')`
   for invalid or out-of-range input. Cite the standard in a comment.
2. `tests/<name>.test.js` — reference values from the published standard, edge cases,
   invalid input (`node:test` + `node:assert/strict`).
3. `<slug>/index.html` — copy an existing calculator page; change title, meta
   description, canonical, JSON-LD, H1, the form, and the inline module script that
   imports your calc module and `../js/ui.js`. Keep the explanation sections
   (what it does, formula, worked example, common mistakes, standard).
4. Add a card to `index.html` and a `<url>` to `sitemap.xml`.
5. Run `node --test` and `node tools/check-links.mjs`.

## Deploy on GitHub Pages

1. Push to GitHub. In the repo: **Settings → Pages → Build and deployment →
   Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
2. The site is served at `https://<user>.github.io/<repo>/`. The base URL used in
   canonical tags, JSON-LD, `sitemap.xml`, `robots.txt` and `404.html` must match it.
   To change it (e.g. custom domain):

   ```sh
   node tools/set-base-url.mjs https://www.example.com/
   ```

3. For a custom domain, add a `CNAME` file containing the domain and configure DNS
   as described in the GitHub Pages docs.
4. Submit `sitemap.xml` in Google Search Console.

## Disclaimer

Reference tool only. Verify results against manufacturer datasheets and your site
standards before any safety-critical use.
