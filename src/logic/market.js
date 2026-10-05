import { vehicleTier } from './team.js';
import { LOCATIONS, locById } from '../config/locations.js';
import { EVENTS } from '../data/events.js';
import { pick, between, int, clamp } from '../util/rng.js';

export function initMarket() {
  const loc = {};
  for (const l of LOCATIONS) loc[l.id] = { idx: 1, demand: l.demand, trend: 0 };
  return { loc, events: [] };
}
const evSum = (s, id, key) => s.market.events.filter((e) => e.loc === id).reduce((a, e) => a + e[key], 0);
export const priceIdx = (s, id) => s.market.loc[id].idx * (1 + evSum(s, id, 'price'));
export const demandOf = (s, id) => clamp(Math.round(s.market.loc[id].demand + evSum(s, id, 'demand')), 5, 100);
export const ppsyOf = (s, id) => Math.round(locById(id).ppsy * priceIdx(s, id));
// Far areas also need a vehicle. Players who already have a property there keep access (old saves are never locked out).
export const unlocked = (s) => LOCATIONS.filter((l) => l.minLevel <= s.player.level && (!l.minVehicle || vehicleTier(s) >= l.minVehicle || s.properties.some((p) => p.location === l.id && p.status !== 'market' && p.status !== 'gone')));

export function driftMarket(s, rand) {
  for (const l of LOCATIONS) {
    const m = s.market.loc[l.id];
    const step = between(rand, -0.012, 0.014) + (m.demand - 60) * 0.0002;
    m.idx = clamp(m.idx * (1 + step), 0.75, 1.25);
    m.demand = clamp(m.demand + between(rand, -2, 2), 30, 90);
    m.trend = step > 0.003 ? 1 : step < -0.003 ? -1 : 0;
  }
  s.market.events = s.market.events.filter((e) => e.endWeek > s.week);
  if (s.market.events.length < 2 && rand() < 0.35) {
    const loc = pick(rand, unlocked(s));
    if (!s.market.events.some((e) => e.loc === loc.id)) {
      const t = pick(rand, EVENTS);
      s.market.events.push({ id: 'ev' + s.week + loc.id, loc: loc.id, text: t.text(loc.name), demand: t.demand, price: t.price, endWeek: s.week + t.weeks });
    }
  }
}
export { int };
