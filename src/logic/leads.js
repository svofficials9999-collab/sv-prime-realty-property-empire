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
  return made;
}
export function expireLeads(s) {
  for (const l of s.leads) if (['new', 'contacted', 'visited'].includes(l.status) && l.expiresWeek <= s.week) { l.status = 'expired'; l.result = { kind: 'expired' }; }
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
