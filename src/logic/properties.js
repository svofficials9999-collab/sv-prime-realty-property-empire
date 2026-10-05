import { TYPES, TYPE_IDS } from '../data/propertyTypes.js';
import { locById } from '../config/locations.js';
import { ppsyOf, unlocked } from './market.js';
import { pick, between, int } from '../util/rng.js';
import { roundTo } from '../util/money.js';
import { slots } from './upgrades.js';


export function createProperty(s, rand, opts = {}) {
  const loc = opts.location ? locById(opts.location) : pick(rand, unlocked(s));
  const type = opts.type || pick(rand, TYPE_IDS);
  const t = TYPES[type];
  const area = roundTo(between(rand, t.size[0], t.size[1]), 10);
  const price = roundTo(ppsyOf(s, loc.id) * area * t.eq * t.mult * between(rand, 0.95, 1.05), 10000);
  const floor = roundTo(price * between(rand, 0.92, 0.96), 5000);
  const yld = t.yield === 0 ? 0 : +(t.yield + (loc.yield - 3) * 0.5).toFixed(1);
  const rentWeekly = Math.round((price * yld) / 100 / 52 / 100) * 100;
  return {
    id: 'p' + s.week + '_' + s.properties.length + '_' + int(rand, 100, 999),
    type, location: loc.id, area, unit: t.unit,
    title: `${t.label} in ${loc.name}`,
    ask: price, floor, yieldPct: yld, rentWeekly,
    status: 'market', forSale: false, createdWeek: s.week,
  };
}
export const listingCount = (s) => s.properties.filter((p) => p.status === 'listed' || (p.status === 'owned' && p.forSale)).length;
export const slotsFree = (s) => slots(s) - listingCount(s);

export function takeListing(s, id) {
  const p = s.properties.find((x) => x.id === id);
  if (!p || p.status !== 'market') return { ok: false, msg: 'Not available' };
  if (slotsFree(s) <= 0) return { ok: false, msg: 'No free listing slots. Upgrade your Office.' };
  p.status = 'listed';
  return { ok: true, p };
}
export function buyProperty(s, id) {
  const p = s.properties.find((x) => x.id === id);
  if (!p || p.status !== 'market') return { ok: false, msg: 'Not available' };
  if (s.player.cash < p.ask) return { ok: false, msg: 'Not enough cash' };
  s.player.cash -= p.ask;
  p.status = 'owned';
  p.forSale = false;
  p.boughtAt = p.ask;
  return { ok: true, p };
}
export function toggleForSale(s, id) {
  const p = s.properties.find((x) => x.id === id);
  if (!p || p.status !== 'owned') return { ok: false, msg: 'Not an owned property' };
  if (!p.forSale && slotsFree(s) <= 0) return { ok: false, msg: 'No free listing slots. Upgrade your Office.' };
  p.forSale = !p.forSale;
  return { ok: true, p };
}
export function withdrawListing(s, id) {
  const p = s.properties.find((x) => x.id === id);
  if (!p || p.status !== 'listed') return { ok: false, msg: 'Not a listing' };
  if (s.leads.some((l) => l.propertyId === id && ['contacted', 'visited', 'negotiating'].includes(l.status))) return { ok: false, msg: 'Finish the active lead first' };
  p.status = 'market';
  for (const l of s.leads) if (l.propertyId === id && l.status === 'new') { l.status = 'expired'; l.result = { kind: 'expired' }; }
  return { ok: true, p };
}
export const marketCount = (s) => s.properties.filter((p) => p.status === 'market').length;
// owned properties re-price with the market so investments can appreciate
export function repriceOwned(s) {
  for (const p of s.properties) {
    if (p.status !== 'owned') continue;
    const t = TYPES[p.type];
    const now = roundTo(ppsyOf(s, p.location) * p.area * t.eq * t.mult, 10000);
    p.ask = now;
    p.floor = roundTo(now * 0.94, 5000);
  }
}
