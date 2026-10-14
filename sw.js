// Offline-first app shell. Bump VERSION on every release so phones pick up new files.
const PREFIX = 'svpe-';
const VERSION = 'svpe-v1.3.3-cache-isolation';
const FILES = ['./', './index.html', './manifest.webmanifest', './src/config/balance.js','./src/config/constants.js','./src/config/locations.js','./src/data/archetypes.js','./src/data/events.js','./src/data/missions.js','./src/data/propertyTypes.js','./src/data/upgrades.js','./src/data/brand.js','./src/data/team.js','./src/data/mapLayout.js','./src/services/backup.js','./src/ui/screens/help.js','./src/logic/team.js','./src/ui/screens/team.js','./src/logic/customers.js','./src/logic/deals.js','./src/logic/leads.js','./src/logic/market.js','./src/logic/missions.js','./src/logic/negotiation.js','./src/logic/properties.js','./src/logic/siteVisit.js','./src/logic/upgrades.js','./src/logic/xp.js','./src/main.js','./src/services/clock.js','./src/services/storage.js','./src/state/actions.js','./src/state/newGame.js','./src/state/selectors.js','./src/state/store.js','./src/ui/components.js','./src/ui/router.js','./src/ui/screens/business.js','./src/ui/screens/deal.js','./src/ui/screens/home.js','./src/ui/screens/leads.js','./src/ui/screens/map.js','./src/ui/screens/mine.js','./src/ui/screens/missions.js','./src/ui/screens/negotiation.js','./src/ui/screens/onboarding.js','./src/ui/screens/profile.js','./src/ui/screens/properties.js','./src/ui/screens/visit.js','./src/ui/theme.css','./src/util/dom.js','./src/util/money.js','./src/util/rng.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => Promise.all(FILES.map((u) => fetch(new Request(u, { cache: 'reload' })).then((r) => { if (!r.ok) throw new Error(u); return c.put(u, r); })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIX) && k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const root = new URL('./', self.location.href);
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return;
  if (url.pathname === new URL('manifest.webmanifest', root).pathname) {
    e.respondWith((async () => { const c = await caches.open(VERSION); try { const r = await fetch(e.request, { cache: 'no-store' }); if (r.ok) await c.put(e.request, r.clone()); return r; } catch { return await c.match(e.request) || Response.error(); } })());
    return;
  }
  e.respondWith(caches.open(VERSION).then((c) => c.match(e.request, { ignoreSearch: true })).then((hit) => hit || fetch(e.request).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res; }).catch(() => caches.open(VERSION).then((c) => c.match('./index.html')))));
});
