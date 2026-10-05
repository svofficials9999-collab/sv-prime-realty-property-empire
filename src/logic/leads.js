import { B } from '../config/balance.js';
import { createCustomer } from './customers.js';
import { leadChance } from './upgrades.js';
import { int } from '../util/rng.js';

export const isOpen = (l) => ['new', 'contacted', 'visited', 'negotiating'].includes(l.status);
export const openLeads = (s) => s.leads.filter(isOpen);
export const forSaleProps = (s) => s.properties.filter((p) => p.status === 'listed' || (p.status === 'owned' && p.forSale));

export function createLead(s, rand, property, forceFit = false) {
  const c = createCustomer(s, rand, property, forceFit);
  s.customers.push(c);
  const lead = {
    id: 'l' + s.week + '_' + int(rand, 1000, 9999) + '_' + s.leads.length,
    propertyId: property.id, customerId: c.id, status: 'new',
    source: ['Walk-in', 'Ads', 'Referral', 'Portal'][int(rand, 0, 3)],
    createdWeek: s.week, expiresWeek: s.week + B.leadLifeWeeks,
    visit: null, neg: null, result: null,
  };
  s.leads.push(lead);
  return lead;
}
export function weeklyLeads(s, rand) {
  let made = 0;
  for (const p of forSaleProps(s)) {
    if (openLeads(s).length >= B.maxOpenLeads) break;
    if (s.leads.some((l) => l.propertyId === p.id && isOpen(l)) && rand() < 0.5) continue;
    if (rand() < leadChance(s)) { createLead(s, rand, p); made++; }
  }
  // Dry-spell guard: with a live listing, nothing open and no lead for 3 weeks, one buyer shows up.
  const live = forSaleProps(s);
  if (!made && live.length && !openLeads(s).length) {
    const last = s.leads.reduce((m, l) => Math.max(m, l.createdWeek || 0), 0);
    if (s.week - last >= 3) { createLead(s, rand, live[int(rand, 0, live.length - 1)]); made++; }
  }
  return made;
}
export function expireLeads(s) {
  for (const l of s.leads) if (['new', 'contacted', 'visited'].includes(l.status) && l.expiresWeek <= s.week) { l.status = 'expired'; l.result = { kind: 'expired' }; }
}
// Keeps every lead and its negotiation in step. Lead status is the master for closed leads
// (won/lost/expired close the negotiation); a recorded deal is the master for "won".
// Never touches cash, XP or deals, so it is safe to run on old saves.
export function syncLeads(s) {
  if (!s || !Array.isArray(s.leads)) return 0;
  let fixed = 0;
  for (const l of s.leads) {
    const n = l.neg;
    const deal = (s.deals || []).find((d) => d.leadId === l.id);
    const prop = (s.properties || []).find((p) => p.id === l.propertyId);
    if (deal && l.status !== 'won') { l.status = 'won'; l.result = { kind: 'won', dealId: deal.id }; fixed++; }
    else if (!deal && prop && prop.status === 'sold' && ['new', 'contacted', 'visited', 'negotiating'].includes(l.status)) {
      l.status = 'lost'; l.result = { kind: 'lost', reason: 'sold' }; if (n && n.status === 'open') n.reason = 'sold'; fixed++;
    }
    if (l.status === 'won') {
      if (n && n.status !== 'won') { n.status = 'won'; if (n.price == null) n.price = deal ? deal.price : n.offer; fixed++; }
    } else if (l.status === 'lost' || l.status === 'expired') {
      if (n && n.status === 'open') { n.status = 'lost'; n.reason = n.reason || (l.result && l.result.reason) || l.status; fixed++; }
    } else if (n && n.status === 'lost') {
      l.status = 'lost'; l.result = l.result || { kind: 'lost', reason: n.reason || 'lost' }; fixed++;
    }
    if (l.status === 'lost' && n && n.status === 'open') { n.status = 'lost'; fixed++; }
  }
  return fixed;
}
export function boostLeads(s, rand) {
  const props = forSaleProps(s);
  if (!props.length) return { ok: false, msg: 'List a property first' };
  if (s.player.tokens < 1) return { ok: false, msg: 'You need 1 property token' };
  if (openLeads(s).length >= B.maxOpenLeads) return { ok: false, msg: 'Too many open leads' };
  s.player.tokens -= 1;
  for (let i = 0; i < B.boostLeads; i++) createLead(s, rand, props[int(rand, 0, props.length - 1)]);
  return { ok: true };
}
