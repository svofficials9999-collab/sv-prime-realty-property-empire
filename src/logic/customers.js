import { ARCHETYPES, NAMES } from '../data/archetypes.js';
import { TYPE_IDS } from '../data/propertyTypes.js';
import { unlocked } from './market.js';
import { pick, between, int } from '../util/rng.js';
import { roundTo } from '../util/money.js';
import { budgetBonus } from './upgrades.js';

export function createCustomer(s, rand, property, forceFit = false) {
  const a = pick(rand, ARCHETYPES);
  const bonus = budgetBonus(s);
  const budget = roundTo(property.ask * between(rand, a.budget[0] + bonus, a.budget[1] + bonus), 10000);
  return {
    id: 'c' + s.week + '_' + int(rand, 1000, 9999) + '_' + s.customers.length,
    name: pick(rand, NAMES),
    archetype: a.id, archetypeLabel: a.label,
    budget: forceFit ? Math.max(budget, roundTo(property.ask * 1.08, 10000)) : budget,
    prefLocation: forceFit || rand() < 0.75 ? property.location : pick(rand, unlocked(s)).id,
    prefType: forceFit || rand() < 0.8 ? property.type : pick(rand, TYPE_IDS),
    urgency: int(rand, a.urgency[0], a.urgency[1]),
    skill: int(rand, a.skill[0], a.skill[1]),
    risk: int(rand, a.risk[0], a.risk[1]),
    openPct: between(rand, a.open[0], a.open[1]),
    satisfaction: 60,
  };
}
