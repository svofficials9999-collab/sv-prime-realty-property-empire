import { clamp, between } from '../util/rng.js';
import { concedeBonus } from './upgrades.js';
import { visitBonus } from './team.js';

export function fitScore(c, p) {
  const loc = c.prefLocation === p.location ? 40 : 10;
  const type = c.prefType === p.type ? 30 : 5;
  const budget = c.budget >= p.ask ? 30 : c.budget >= p.floor ? 20 : 5;
  return { loc, type, budget, total: loc + type + budget };
}
const COMMENT = {
  liked: 'Loved it. Buyer is excited and will pay close to the asking price.',
  neutral: 'Interested but comparing options. Expect a normal negotiation.',
  disliked: 'Not impressed. Buyer will push the price down hard.',
};
export function runVisit(s, rand, lead) {
  const c = s.customers.find((x) => x.id === lead.customerId);
  const p = s.properties.find((x) => x.id === lead.propertyId);
  const fit = fitScore(c, p);
  const roll = between(rand, -10, 10) + concedeBonus(s) * 50 + visitBonus(s);
  const score = clamp(fit.total + roll, 0, 100);
  const outcome = score >= 75 ? 'liked' : score >= 50 ? 'neutral' : 'disliked';
  const delta = { liked: 10, neutral: 0, disliked: -12 }[outcome];
  c.satisfaction = clamp(c.satisfaction + delta, 0, 100);
  lead.visit = { fit, score: Math.round(score), outcome, comment: COMMENT[outcome], week: s.week };
  return lead.visit;
}
export const visitBudgetFactor = { liked: 0.99, neutral: 0.96, disliked: 0.9 };
