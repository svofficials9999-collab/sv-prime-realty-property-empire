import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../src/state/newGame.js';
import { inr, inrShort } from '../src/util/money.js';
import { xpNeeded, titleFor, addXp } from '../src/logic/xp.js';
import { counter, accept, canAccept } from '../src/logic/negotiation.js';
import { commissionRate, upgradeCost, buyUpgrade, slots } from '../src/logic/upgrades.js';
import { parse, serialize } from '../src/services/storage.js';
import { tick } from '../src/state/actions.js';
import { makeRand } from '../src/util/rng.js';
import { createProperty } from '../src/logic/properties.js';

const mk = () => newGame('T', 12345, '2026-10-05');

test('money format', () => {
  assert.equal(inr(7500000), '₹75,00,000');
  assert.equal(inrShort(7500000), '₹75 L');
  assert.equal(inrShort(12500000), '₹1.25 Cr');
});
test('xp and titles', () => {
  assert.equal(xpNeeded(1), 100);
  assert.equal(xpNeeded(4), 800);
  assert.equal(titleFor(1), 'Small Broker');
  assert.equal(titleFor(5), 'Property Agent');
  assert.equal(titleFor(10), 'Senior Agent');
  assert.equal(titleFor(20), 'Property Developer');
  assert.equal(titleFor(50), 'Real Estate Tycoon');
  const s = mk(); assert.equal(addXp(s, 100), 1); assert.equal(s.player.level, 2); assert.equal(s.player.xp, 0);
  assert.equal(addXp(s, 100 + 283), 1); assert.equal(s.player.level, 3);
});
test('commission: 50L x 2% = 1,00,000', () => {
  const s = mk();
  assert.equal(commissionRate(s), 0.02);
  assert.equal(Math.round(5000000 * commissionRate(s)), 100000);
  s.business.service = 5; assert.ok(Math.abs(commissionRate(s) - 0.03) < 1e-9);
});
test('upgrade cost scales and deducts cash', () => {
  const s = mk();
  assert.equal(upgradeCost('office', 0), 200000);
  assert.equal(upgradeCost('office', 1), 360000);
  s.player.cash = 200000;
  const r = buyUpgrade(s, 'office');
  assert.ok(r.ok); assert.equal(s.player.cash, 0); assert.equal(slots(s), 5);
  assert.equal(buyUpgrade(s, 'office').ok, false);
});
test('negotiation example 75L ask / 65L offer / 72L floor', () => {
  const n = { ask: 7500000, floor: 7200000, buyerMax: 7400000, offer: 6500000, round: 1, maxRounds: 5, patience: 4, concede: 0.55, history: [], status: 'open' };
  assert.equal(canAccept(n), false);
  assert.equal(counter(n, 7100000).ok, false); // below floor
  let r = counter(n, 7500000); // above buyerMax -> counter
  assert.equal(r.outcome, 'counter'); assert.ok(n.offer > 6500000 && n.offer <= 7400000);
  r = counter(n, 7400000); // at buyerMax -> won
  assert.equal(r.outcome, 'won'); assert.equal(n.price, 7400000);
});
test('negotiation loses on patience', () => {
  const n = { ask: 7500000, floor: 7200000, buyerMax: 7000000, offer: 6500000, round: 1, maxRounds: 5, patience: 2, concede: 0.5, history: [], status: 'open' };
  assert.equal(counter(n, 7500000).outcome, 'counter');
  assert.equal(counter(n, 7500000).outcome, 'lost');
  assert.equal(n.status, 'lost');
});
test('accept requires offer >= floor', () => {
  const n = { floor: 7200000, offer: 7200000, status: 'open', history: [] };
  assert.equal(accept(n).outcome, 'won'); assert.equal(n.price, 7200000);
});
test('save round trip and corruption', () => {
  const s = mk(); const raw = serialize(s);
  assert.deepEqual(parse(raw), s);
  assert.equal(parse(raw.replace('"cash', '"cosh')), null);
  assert.equal(parse('garbage'), null);
});
test('seeded determinism', () => {
  const a = mk(), b = mk();
  assert.deepEqual(a.properties.map((p) => p.ask), b.properties.map((p) => p.ask));
  tick(a, '2026-10-05'); tick(b, '2026-10-05');
  assert.deepEqual(JSON.stringify(a), JSON.stringify(b));
});
test('property prices are sane (plot Kukatpally 150-300 sq yd)', () => {
  const s = mk(); const r = makeRand(s);
  for (let i = 0; i < 200; i++) {
    const p = createProperty(s, r);
    assert.ok(p.ask > 1000000 && p.ask < 400000000, p.title + ' ' + p.ask);
    assert.ok(p.floor < p.ask && p.floor > p.ask * 0.85);
  }
});
test('tick: rent, energy, leads, missions reset on new date', () => {
  const s = mk();
  const own = s.properties.find((p) => p.status === 'listed' && p.rentWeekly > 0);
  own.status = 'owned'; s.player.energy = 3;
  const cash = s.player.cash;
  const r = tick(s, '2026-10-06');
  assert.equal(s.player.energy, 5);
  assert.equal(r.rent, own.rentWeekly); assert.equal(s.player.cash, cash + own.rentWeekly);
  assert.equal(s.missions.date, '2026-10-06');
  for (let i = 0; i < 40; i++) tick(s, '2026-10-06');
  assert.ok(s.leads.length > 1);
  assert.ok(s.properties.filter((p) => p.status === 'market').length >= 6);
});
