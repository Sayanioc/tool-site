// Shared DOM helpers for every calculator page. Keep math out of here (see /js/calc/).

export const $ = (id) => document.getElementById(id);

/** Parse a number from an input; accepts comma decimal. Empty -> NaN. */
export function readNum(el) {
  const s = String(el.value ?? '').trim().replace(',', '.');
  if (s === '') return NaN;
  const v = Number(s);
  return Number.isFinite(v) ? v : NaN;
}

/** Fixed decimals, strips "-0". Non-finite -> ''. */
export function fmt(x, dp = 3) {
  if (!Number.isFinite(x)) return '';
  const s = x.toFixed(dp);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
}

/** Like fmt() but with an explicit "+" for positive values (errors, deviations). */
export function fmtSigned(x, dp = 3) {
  const s = fmt(x, dp);
  return s && !s.startsWith('-') && Number(s) !== 0 ? `+${s}` : s;
}

/** Significant-figure formatting for converters (up to `sig` digits, no trailing zeros). */
export function fmtSig(x, sig = 6) {
  if (!Number.isFinite(x)) return '';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e9 || a < 1e-6) return x.toExponential(sig - 1).replace(/\.?0+e/, 'e');
  const dp = Math.max(0, sig - 1 - Math.floor(Math.log10(a)));
  return Number(x.toFixed(Math.min(dp, 12))).toString();
}

/** Restore form controls from the query string. Returns true if anything restored. */
export function restoreFromQuery(ids) {
  const p = new URLSearchParams(location.search);
  let any = false;
  for (const id of ids) {
    if (!p.has(id)) continue;
    const el = $(id);
    if (!el) continue;
    if (el.type === 'checkbox') el.checked = p.get(id) === '1';
    else el.value = p.get(id);
    any = true;
  }
  // radio groups: name=value
  for (const [k, v] of p) {
    const r = document.querySelector(`input[type=radio][name="${CSS.escape(k)}"][value="${CSS.escape(v)}"]`);
    if (r) { r.checked = true; any = true; }
  }
  return any;
}

/** Mirror the given controls (and checked radio groups) into the URL without reloading. */
export function writeQuery(ids, radioNames = []) {
  const p = new URLSearchParams();
  for (const id of ids) {
    const el = $(id);
    if (!el) continue;
    if (el.type === 'checkbox') { if (el.checked) p.set(id, '1'); }
    else if (el.value !== '') p.set(id, el.value);
  }
  for (const n of radioNames) {
    const r = document.querySelector(`input[type=radio][name="${n}"]:checked`);
    if (r) p.set(n, r.value);
  }
  const q = p.toString();
  history.replaceState(null, '', q ? `?${q}` : location.pathname);
}

export function radioValue(name) {
  const r = document.querySelector(`input[type=radio][name="${name}"]:checked`);
  return r ? r.value : '';
}

/** Show / clear an inline error tied to an input (expects <p id="<id>-err" class="err">). */
export function setFieldError(id, msg) {
  const el = $(id);
  const err = $(`${id}-err`);
  if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (err) err.textContent = msg || '';
}

/** Show a message in a .msg box: kind = 'bad' | 'warn' | 'ok' | ''. */
export function setMsg(id, text, kind = 'bad') {
  const el = $(id);
  if (!el) return;
  el.textContent = text || '';
  el.className = `msg ${text ? kind : ''}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/**
 * Wire the standard "Copy result" / "Copy link" buttons.
 * Page markup: <button id="copy-result">, <button id="copy-link">, <span id="copy-status" role="status">.
 */
export function setupCopyButtons(getResultText) {
  const status = $('copy-status');
  const say = (t) => { if (status) { status.textContent = t; setTimeout(() => { status.textContent = ''; }, 2500); } };
  $('copy-result')?.addEventListener('click', async () => {
    const t = getResultText();
    if (!t) return say('Nothing to copy yet');
    say((await copyText(`${t}\n${location.href}`)) ? 'Result copied' : 'Copy failed');
  });
  $('copy-link')?.addEventListener('click', async () => {
    say((await copyText(location.href)) ? 'Link copied' : 'Copy failed');
  });
}

/** Call fn on input/change of any listed control (ids or radio names). */
export function onAnyInput(ids, fn) {
  for (const id of ids) {
    const el = $(id);
    if (el) { el.addEventListener('input', fn); el.addEventListener('change', fn); }
    else document.querySelectorAll(`input[name="${id}"]`).forEach((r) => r.addEventListener('change', fn));
  }
}
