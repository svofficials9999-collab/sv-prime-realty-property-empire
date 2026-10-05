import { B } from '../config/balance.js';
import { clamp } from '../util/rng.js';
import { roundTo } from '../util/money.js';
import { concedeBonus } from './upgrades.js';
import { visitBudgetFactor } from './siteVisit.js';
import { TYPES } from '../data/propertyTypes.js';

// Neg object: {ask,floor,buyerMax(hidden),offer,round,maxRounds,patience,skill,concede,history[],status,price}
export function startNegotiation(s, lead) {
  const c = s.customers.find((x) => x.id === lead.customerId);
  const p = s.properties.find((x) => x.id === lead.propertyId);
  const factor = visitBudgetFactor[lead.visit ? lead.visit.outcome : 'neutral'];
  const buyerMax = roundTo(Math.min(c.budget, p.ask * factor), 1000);
  const offer = Math.min(roundTo(p.ask * c.openPct, 1000), buyerMax);
  const tp = TYPES[p.type] || {};
  const patience = clamp(Math.round(6 - c.urgency * 0.8) + (tp.patience || 0), 2, B.maxRounds);
  lead.neg = {
    ask: p.ask, floor: p.floor, buyerMax, offer, round: 1, maxRounds: B.maxRounds, patience,
    concede: clamp(0.55 - 0.08 * (c.skill - 3) + concedeBonus(s) + (tp.concede || 0), 0.3, 0.75),
    history: [{ by: 'buyer', price: offer }], status: 'open', price: null, note: 'Buyer opens with an offer.',
  };
  lead.status = 'negotiating';
  return lead.neg;
}
export const canAccept = (n) => n.status === 'open' && n.offer >= n.floor;

// Player accepts the buyer's current offer (only if at/above seller floor).
export function accept(n) {
  if (!canAccept(n)) return { ok: false, msg: "Below the seller's expected price" };
  n.status = 'won'; n.price = n.offer; n.history.push({ by: 'player', price: n.offer, accepted: true });
  return { ok: true, outcome: 'won' };
}
export function walk(n) { if (n.status !== 'open') return { ok: false, msg: 'Negotiation is over' }; n.status = 'lost'; n.note = 'You walked away.'; n.reason = 'walked'; return { ok: true, outcome: 'lost' }; }

// Player counters with a price. Outcomes: won | counter | lost.
export function counter(n, price) {
  if (n.status !== 'open') return { ok: false, msg: 'Negotiation is over' };
  price = Math.round(price);
  if (price < n.floor) return { ok: false, msg: "Counter is below the seller's expected price" };
  n.history.push({ by: 'player', price });
  if (price <= n.buyerMax) {
    n.status = 'won'; n.price = price; n.note = 'Buyer accepted your counter.';
    return { ok: true, outcome: 'won' };
  }
  n.patience -= price > n.buyerMax * 1.12 ? 2 : 1;
  n.round += 1;
  if (n.patience <= 0 || n.round > n.maxRounds) {
    n.status = 'lost'; n.reason = 'patience'; n.note = 'Buyer lost patience and walked out.';
    return { ok: true, outcome: 'lost' };
  }
  const target = Math.min(price, n.buyerMax);
  let next = roundTo(n.offer + (target - n.offer) * n.concede, 1000);
  next = Math.min(Math.max(next, n.offer), n.buyerMax);
  n.offer = next;
  n.history.push({ by: 'buyer', price: next });
  n.note = next >= n.buyerMax ? 'Buyer says this is their final stretch.' : 'Buyer moves up and counters.';
  return { ok: true, outcome: 'counter' };
}
