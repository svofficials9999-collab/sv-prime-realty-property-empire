import { B } from '../config/balance.js';
import { SAVE_VERSION } from '../config/constants.js';
import { initMarket } from '../logic/market.js';
import { createProperty, marketCount } from '../logic/properties.js';
import { createLead } from '../logic/leads.js';
import { freshMissions } from '../logic/missions.js';
import { makeRand } from '../util/rng.js';

export function newGame(name, seed, today) {
  const s = {
    version: SAVE_VERSION, rng: seed >>> 0, week: 1, savedAt: 0, today,
    player: { name: name || 'Agent', level: 1, xp: 0, cash: B.startCash, tokens: 0, energy: B.maxEnergy },
    business: { office: 0, marketing: 0, sales: 0, tech: 0, propmgmt: 0, service: 0 },
    properties: [], leads: [], customers: [], deals: [],
    stats: { deals: 0, sales: 0, earned: 0, lost: 0 },
    market: initMarket(), missions: freshMissions(today),
    tutorial: { done: false },
    nav: { route: 'home', params: {} }, ui: {},
  };
  const rand = makeRand(s);
  const starters = [['kukatpally', 'plot'], ['miyapur', 'bhk2'], ['kukatpally', 'bhk2']];
  const made = starters.map(([location, type]) => { const p = createProperty(s, rand, { location, type }); p.status = 'listed'; s.properties.push(p); return p; });
  createLead(s, rand, made[0], true); // guaranteed winnable first lead for the tutorial
  while (marketCount(s) < 6) s.properties.push(createProperty(s, rand));
  return s;
}
