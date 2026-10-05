import { B } from '../config/balance.js';
import { commissionRate } from './upgrades.js';
import { TYPES } from '../data/propertyTypes.js';

// Closes a won negotiation: client property pays commission; player-owned property pays full price.
export function closeDeal(s, lead) {
  const n = lead.neg;
  const p = s.properties.find((x) => x.id === lead.propertyId);
  const c = s.customers.find((x) => x.id === lead.customerId);
  if (!p || p.status === 'sold' || lead.status === 'won') return s.deals.find((d) => d.leadId === lead.id) || null;
  const price = n.price;
  const own = p.status === 'owned';
  const tp = TYPES[p.type] || {};
  const rate = own ? 0 : commissionRate(s) * (tp.comm || 1);
  const commission = own ? 0 : Math.round(price * rate);
  const proceeds = own ? price : commission;
  // Own-property resales earn XP on profit only, so buy/sell loops cannot farm levels.
  const xpBase = own ? Math.max(0, price - (p.boughtAt || price)) : proceeds;
  const xp = B.xpDeal + Math.floor(xpBase / B.xpPerCommission) + (own ? 0 : tp.xp || 0);
  s.player.cash += proceeds;
  p.status = 'sold'; p.forSale = false; p.soldPrice = price;
  c.satisfaction = Math.min(100, c.satisfaction + 15);
  const deal = { id: 'd' + (s.deals.length + 1), leadId: lead.id, propertyId: p.id, customerId: c.id, price, rate, commission, proceeds, own, xp, week: s.week };
  s.deals.push(deal);
  s.stats.deals += 1; s.stats.sales += price; s.stats.earned += proceeds;
  lead.status = 'won'; lead.result = { kind: 'won', dealId: deal.id };
  // other open leads on this property are closed
  for (const l of s.leads) if (l.id !== lead.id && l.propertyId === p.id && ['new', 'contacted', 'visited', 'negotiating'].includes(l.status)) { l.status = 'lost'; l.result = { kind: 'lost', reason: 'sold' }; if (l.neg && l.neg.status === 'open') { l.neg.status = 'lost'; l.neg.reason = 'sold'; } }
  return deal;
}
