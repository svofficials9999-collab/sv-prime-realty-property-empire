import { payStaff, hireStaff, fireStaff, buyVehicle } from '../logic/team.js';
import { B } from '../config/balance.js';
import { makeRand } from '../util/rng.js';
import { driftMarket } from '../logic/market.js';
import { createProperty, marketCount, repriceOwned, takeListing, buyProperty, toggleForSale, withdrawListing } from '../logic/properties.js';
import { weeklyLeads, expireLeads, boostLeads } from '../logic/leads.js';
import { runVisit } from '../logic/siteVisit.js';
import { startNegotiation, counter, accept, walk, canAccept } from '../logic/negotiation.js';
import { closeDeal } from '../logic/deals.js';
import { buyUpgrade } from '../logic/upgrades.js';
import { addXp } from '../logic/xp.js';
import { track, ensureMissions, claim } from '../logic/missions.js';
import { rentMult } from '../logic/upgrades.js';
import { unlocked } from '../logic/market.js';

const rnd = (s) => makeRand(s);
const lead = (s, id) => s.leads.find((l) => l.id === id);
const lvlMsg = (s, g) => (g ? ` Level up! You are now level ${s.player.level}.` : '');

// One game week passes.
export function tick(s, today) {
  const rand = rnd(s);
  s.week += 1;
  s.player.energy = Math.min(B.maxEnergy, s.player.energy + B.energyRegen);
  let rent = 0;
  for (const p of s.properties) if (p.status === 'owned' && p.rentWeekly) rent += Math.round(p.rentWeekly * rentMult(s));
  s.player.cash += rent;
  s.stats.earned += rent;
  driftMarket(s, rand);
  repriceOwned(s);
  if (s.week % B.marketSpawnEvery === 0) {
    for (const p of s.properties) if (p.status === 'market' && p.createdWeek < s.week - 6 && s.properties.filter((x) => x.status === 'market').length > 6) p.status = 'gone';
    let guard = 0;
    while (marketCount(s) < B.marketPoolMax && guard++ < 4) s.properties.push(createProperty(s, rand));
  }
  const payroll = payStaff(s);
  const newLeads = weeklyLeads(s, rand);
  expireLeads(s);
  if (today) { s.today = today; ensureMissions(s, today); }
  return { rent, newLeads, payroll };
}
export function takeListingAction(s, id) {
  const r = takeListing(s, id);
  if (r.ok) track(s, 'add');
  return r;
}
export function buyPropertyAction(s, id) {
  const r = buyProperty(s, id);
  if (r.ok) track(s, 'add');
  return r;
}
export const hire = (s, id) => hireStaff(s, id);
export const fire = (s, id) => fireStaff(s, id);
export const buyCar = (s, id) => buyVehicle(s, id);
export const toggleForSaleAction = (s, id) => toggleForSale(s, id);
export const withdrawAction = (s, id) => withdrawListing(s, id);

export function contactLead(s, id) {
  const l = lead(s, id);
  if (!l || l.status !== 'new') return { ok: false, msg: 'Lead already contacted' };
  if (s.player.energy < B.contactEnergy) return { ok: false, msg: 'Not enough energy. Advance a week to recover.' };
  s.player.energy -= B.contactEnergy;
  l.status = 'contacted';
  l.expiresWeek = s.week + B.leadLifeWeeks;
  track(s, 'contact');
  const g = addXp(s, B.xpContact);
  return { ok: true, msg: 'Customer contacted.' + lvlMsg(s, g) };
}
export function doVisit(s, id) {
  const l = lead(s, id);
  if (!l || l.status !== 'contacted') return { ok: false, msg: 'Contact the customer first' };
  if (s.player.energy < B.visitEnergy) return { ok: false, msg: 'Not enough energy. Advance a week to recover.' };
  s.player.energy -= B.visitEnergy;
  const v = runVisit(s, rnd(s), l);
  l.status = 'visited';
  l.expiresWeek = s.week + B.leadLifeWeeks;
  track(s, 'visit');
  const g = addXp(s, B.xpVisit);
  return { ok: true, visit: v, msg: 'Site visit done.' + lvlMsg(s, g) };
}
export function beginNegotiation(s, id) {
  const l = lead(s, id);
  if (!l || (l.status !== 'visited' && l.status !== 'negotiating')) return { ok: false, msg: 'Do a site visit first' };
  if (!l.neg) startNegotiation(s, l);
  return { ok: true };
}
function finishIfDone(s, l) {
  const n = l.neg;
  if (n.status === 'won') {
    const deal = closeDeal(s, l);
    if (!deal) return {};
    track(s, 'deal'); track(s, 'sales', deal.price);
    const g = addXp(s, deal.xp);
    deal.levelUp = g > 0;
    return { deal, levelUp: g > 0 };
  }
  if (n.status === 'lost') {
    l.status = 'lost'; l.result = { kind: 'lost', reason: n.reason || 'lost' };
    s.stats.lost += 1;
    const c = s.customers.find((x) => x.id === l.customerId);
    if (c) c.satisfaction = Math.max(0, c.satisfaction - 10);
  }
  return {};
}
export function negCounter(s, id, price) {
  const l = lead(s, id);
  if (!l || !l.neg || l.status !== 'negotiating') return { ok: false, msg: 'No open negotiation' };
  const r = counter(l.neg, price);
  if (!r.ok) return r;
  return { ...r, ...finishIfDone(s, l) };
}
export function negAccept(s, id) {
  const l = lead(s, id);
  if (!l || !l.neg || l.status !== 'negotiating' || !canAccept(l.neg)) return { ok: false, msg: "Below the seller's expected price" };
  const r = accept(l.neg);
  return { ...r, ...finishIfDone(s, l) };
}
export function negWalk(s, id) {
  const l = lead(s, id);
  if (!l || !l.neg || l.status !== 'negotiating') return { ok: false, msg: 'No open negotiation' };
  const r = walk(l.neg);
  return { ...r, ...finishIfDone(s, l) };
}
export function upgrade(s, id) { return buyUpgrade(s, id); }
export function claimMission(s, id) { return claim(s, id); }
export function boost(s) { return boostLeads(s, rnd(s)); }
export function setName(s, name) { s.player.name = String(name || '').trim().slice(0, 24) || s.player.name; return { ok: true }; }
export function finishTutorial(s) { s.tutorial.done = true; return { ok: true }; }
export function nav(s, route, params = {}) { s.nav = { route, params }; return { ok: true }; }
