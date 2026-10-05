import { getState, dispatch, subscribe } from '../state/store.js';
import { nav } from '../state/actions.js';
import { newLeadCount } from '../state/selectors.js';
import { xpNeeded, titleFor } from '../logic/xp.js';
import { inrShort } from '../util/money.js';
import { esc } from '../util/dom.js';

const screens = {};
let root, toastTimer;
export const register = (name, mod) => { screens[name] = mod; };
const stack = [];
let popping = false;
export const go = (route, params = {}) => {
  const cur = getState().nav;
  if (!popping && (cur.route !== route || JSON.stringify(cur.params) !== JSON.stringify(params))) {
    if (!['splash', 'login', 'tutorial'].includes(cur.route)) { stack.push(cur); if (stack.length > 30) stack.shift(); history.pushState({ n: stack.length }, ''); }
  }
  dispatch(nav, route, params); const sc = document.querySelector('.screen'); if (sc) sc.scrollTop = 0;
};
// After a reload on a deep screen, make Back lead to Home instead of leaving the app.
export function seedBack() { if (!stack.length) { stack.push({ route: 'home', params: {} }); history.pushState({ n: 'seed' }, ''); } }
// Android back button: step back through screens instead of leaving the app.
window.addEventListener('popstate', () => {
  const prev = stack.pop();
  if (!prev) return;
  popping = true;
  let r = prev.route; let p = prev.params;
  if (r === 'negotiate' || r === 'deal') { r = 'leads'; p = {}; }
  go(r, p);
  popping = false;
});
export function toast(msg, bad = false) {
  const old = root.querySelector('.toast'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'toast' + (bad ? ' bad' : ''); el.textContent = msg; root.appendChild(el);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.remove(), 3200);
}
const TABS = [['home', '🏠', 'HOME'], ['properties', '🏘️', 'PROPERTIES'], ['leads', '👥', 'LEADS'], ['map', '🗺️', 'MAP'], ['business', '💼', 'BUSINESS']];
const TAB_OF = { home: 'home', missions: 'home', profile: 'home', settings: 'home', properties: 'properties', property: 'properties', mine: 'properties', leads: 'leads', customer: 'leads', visit: 'leads', map: 'map', business: 'business', staff: 'business', garage: 'business' };
const BARE = new Set(['splash', 'login', 'tutorial', 'negotiate', 'deal']);

function hud(s) {
  const p = s.player;
  return `<div class="hud"><div class="av">${esc((p.name[0] || 'A').toUpperCase())}</div>
  <div class="who"><div class="nm">${esc(p.name)} · Lv ${p.level}</div><div class="tt">${titleFor(p.level)}</div>
  <div class="bar" style="height:5px;margin-top:4px"><i style="width:${(p.xp / xpNeeded(p.level)) * 100}%"></i></div></div>
  <div><div class="cash">${inrShort(p.cash)}</div><div class="sub">⚡${p.energy} · Week ${s.week}</div></div></div>`;
}
function render() {
  const s = getState(); if (!s) return;
  const { route, params } = s.nav;
  const sc = screens[route] || screens.home;
  const prev = root.querySelector('.screen');
  const keep = prev && root.dataset.route === route ? prev.scrollTop : 0;
  const bare = BARE.has(route);
  const n = newLeadCount(s);
  const tab = TAB_OF[route];
  root.dataset.route = route;
  root.innerHTML = (bare ? '' : hud(s)) +
    `<div class="screen">${sc.render(s, params)}</div>` +
    (bare ? '' : `<nav class="nav">${TABS.map(([id, ic, lb]) => `<button data-act="go" data-arg="${id}" class="${tab === id ? 'on' : ''}"><span class="ic">${ic}</span>${lb}${id === 'leads' && n ? `<span class="dot">${n}</span>` : ''}</button>`).join('')}</nav>`);
  const el = root.querySelector('.screen'); if (el) el.scrollTop = keep;
}
export function mount(el) {
  root = el;
  subscribe(render);
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]'); if (!t || t.disabled) return;
    const s = getState(); const act = t.dataset.act; const arg = t.dataset.arg;
    if (act === 'go') return go(arg);
    const sc = screens[s.nav.route]; const h = sc && sc.handlers && sc.handlers[act];
    if (h) h({ s, p: s.nav.params, arg, el: t, root, go, toast });
  });
  root.addEventListener('input', (e) => {
    const t = e.target.closest('[data-input]'); if (!t) return;
    const s = getState(); const sc = screens[s.nav.route]; const h = sc && sc.inputs && sc.inputs[t.dataset.input];
    if (h) h({ s, p: s.nav.params, el: t, root });
  });
  render();
}
export const rerender = render;
