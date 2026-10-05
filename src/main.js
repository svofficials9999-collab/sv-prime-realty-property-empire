import { SAVE_KEY } from './config/constants.js';
import { B } from './config/balance.js';
import { load, save, hasSave } from './services/storage.js';
import { today } from './services/clock.js';
import { getState, setState, configure, dispatch, flush } from './state/store.js';
import { tick, nav } from './state/actions.js';
import { ensureMissions } from './logic/missions.js';
import { mount, register, go, toast, seedBack } from './ui/router.js';
import * as onb from './ui/screens/onboarding.js';
import { home } from './ui/screens/home.js';
import { properties, property } from './ui/screens/properties.js';
import { mine } from './ui/screens/mine.js';
import { leads, customer } from './ui/screens/leads.js';
import { visit } from './ui/screens/visit.js';
import { negotiate } from './ui/screens/negotiation.js';
import { deal } from './ui/screens/deal.js';
import { business } from './ui/screens/business.js';
import { missions } from './ui/screens/missions.js';
import { profile, settings } from './ui/screens/profile.js';
import { map } from './ui/screens/map.js';
import { staff, garage } from './ui/screens/team.js';
import { help } from './ui/screens/help.js';
import { inrShort } from './util/money.js';

Object.entries({ splash: onb.splash, login: onb.login, tutorial: onb.tutorial, home, properties, property, mine, leads, customer, visit, negotiate, deal, business, missions, profile, settings, map, staff, garage, help }).forEach(([k, v]) => register(k, v));
configure({ save: (s) => { if (!s.properties || !s.properties.length) return; try { save(s); } catch (e) { console.warn('save failed', e); } } });

const root = document.getElementById('app');
setState({ nav: { route: 'splash', params: {} }, player: { name: '', level: 1, xp: 0, cash: 0, energy: 0, tokens: 0 }, week: 1, ui: {}, leads: [], market: { events: [], loc: {} }, stats: {}, properties: [], missions: { items: [] }, customers: [], deals: [], business: {} });
mount(root);

function boot() {
  const saved = hasSave() ? load() : null;
  if (!saved) return go('login');
  // offline catch-up: a few weeks may have passed while the app was closed
  const gap = Math.min(B.maxCatchupTicks, Math.floor((Date.now() - (saved.savedAt || Date.now())) / B.tickMs));
  setState(saved);
  ensureMissions(saved, today());
  for (let i = 0; i < gap; i++) tick(saved, today());
  const r = saved.nav.route;
  if (['splash', 'login'].includes(r) || (r === 'tutorial' && saved.tutorial.done)) dispatch(nav, 'home', {});
  else { dispatch(nav, r, saved.nav.params || {}); if (r !== 'home') seedBack(); }
  if (gap > 0) toast(`While you were away: ${gap} week${gap > 1 ? 's' : ''} passed.`);
}
setTimeout(boot, 900);

setInterval(() => {
  const s = getState();
  if (document.hidden || !s || !s.properties.length || ['splash', 'login', 'tutorial', 'negotiate'].includes(s.nav.route)) return;
  const r = dispatch(tick, today());
  if (r.newLeads) toast(`${r.newLeads} new lead${r.newLeads > 1 ? 's' : ''} arrived.`);
  else if (r.rent) toast(`Rent received: ${inrShort(r.rent)}`);
}, B.tickMs);
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
window.addEventListener('pagehide', flush);
if ('serviceWorker' in navigator) {
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js').catch(() => {});
  // A new version took over: save and reload once so the player runs the new files.
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) { flush(); location.reload(); } });
}
export { SAVE_KEY };
