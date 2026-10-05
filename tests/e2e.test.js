import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../src/state/newGame.js';
import * as A from '../src/state/actions.js';
import { parse, serialize } from '../src/services/storage.js';
import { xpNeeded } from '../src/logic/xp.js';
import { claim, isDone } from '../src/logic/missions.js';

// Full MVP loop: property -> lead -> customer -> visit -> negotiation -> deal -> commission -> xp -> upgrade -> save
test('full deal loop', () => {
  const s = newGame('Srinivas', 777, '2026-10-05');
  const lead = s.leads[0];
  assert.equal(lead.status, 'new');
  const prop = s.properties.find((p) => p.id === lead.propertyId);
  assert.equal(prop.status, 'listed');

  assert.ok(A.contactLead(s, lead.id).ok);
  assert.equal(s.player.energy, 9); assert.equal(s.player.xp, 5);
  assert.equal(A.contactLead(s, lead.id).ok, false); // no double contact
  assert.equal(A.beginNegotiation(s, lead.id).ok, false); // must visit first

  const v = A.doVisit(s, lead.id);
  assert.ok(v.ok); assert.equal(s.player.energy, 7); assert.equal(s.player.xp, 20);
  assert.ok(['liked', 'neutral', 'disliked'].includes(v.visit.outcome));

  assert.ok(A.beginNegotiation(s, lead.id).ok);
  const n = lead.neg;
  assert.ok(n.buyerMax >= n.floor, 'starter lead must be winnable');
  // play: counter at ask, keep negotiating until won (the buyer max is hidden)
  let out, guard = 0, price = n.ask;
  const cash0 = s.player.cash;
  while (guard++ < 6) {
    out = A.negCounter(s, lead.id, Math.max(n.floor, price));
    if (out.outcome !== 'counter') break;
    price = Math.max(n.floor, n.offer + 1000);
    if (n.offer >= n.floor) { out = A.negAccept(s, lead.id); break; }
  }
  assert.equal(out.outcome, 'won', JSON.stringify(n));
  const d = out.deal;
  assert.equal(d.commission, Math.round(d.price * 0.02));
  assert.equal(s.player.cash, cash0 + d.commission);
  assert.equal(d.xp, 50 + Math.floor(d.commission / 10000));
  assert.equal(prop.status, 'sold');
  assert.equal(lead.status, 'won');
  assert.equal(s.stats.deals, 1);
  // XP math: 5 + 15 + deal xp spread over levels
  let total = 5 + 15 + d.xp, lv = 1;
  while (total >= xpNeeded(lv)) { total -= xpNeeded(lv); lv++; }
  assert.equal(s.player.level, lv); assert.equal(s.player.xp, total);
  // missions progressed: contact 1/5, visit 1/2, deal 1/1, sales
  const it = (id) => s.missions.items.find((i) => i.id === id);
  assert.equal(it('deal1').progress, 1); assert.ok(isDone(s, 'deal1'));
  const before = s.player.cash;
  assert.ok(claim(s, 'deal1').ok); assert.equal(s.player.cash, before + 100000); assert.equal(s.player.tokens, 1);
  assert.equal(claim(s, 'deal1').ok, false);
  // upgrade (give cash if short)
  s.player.cash = Math.max(s.player.cash, 200000);
  const c1 = s.player.cash;
  assert.ok(A.upgrade(s, 'office').ok); assert.equal(s.player.cash, c1 - 200000);
  // save/load
  const back = parse(serialize(s));
  assert.deepEqual(back, s);
});
test('take listing respects slots; buy investment deducts cash; owned property earns rent', () => {
  const s = newGame('T', 99, '2026-10-05');
  const m = s.properties.filter((p) => p.status === 'market');
  assert.equal(A.takeListingAction(s, m[0].id).ok, false); // 3 starter listings fill 3 slots
  s.business.office = 1;
  assert.ok(A.takeListingAction(s, m[0].id).ok);
  const rentable = s.properties.find((p) => p.status === 'market' && p.rentWeekly > 0);
  s.player.cash = rentable.ask;
  assert.ok(A.buyPropertyAction(s, rentable.id).ok);
  assert.equal(s.player.cash, 0);
  const r = A.tick(s, '2026-10-05');
  assert.equal(r.rent, rentable.rentWeekly);
  assert.equal(A.buyPropertyAction(s, m[1].id).ok, false); // no cash
});
test('selling own property pays full price, no commission', () => {
  const s = newGame('T', 5, '2026-10-05');
  s.business.office = 2; s.player.cash = 1e9;
  const p = s.properties.find((x) => x.status === 'market');
  A.buyPropertyAction(s, p.id);
  assert.ok(A.toggleForSaleAction(s, p.id).ok);
  for (let i = 0; i < 80 && !s.leads.some((l) => l.propertyId === p.id); i++) A.tick(s, '2026-10-05');
  const l = s.leads.find((x) => x.propertyId === p.id);
  assert.ok(l, 'lead should arrive for for-sale owned property');
  s.player.energy = 10; A.contactLead(s, l.id); A.doVisit(s, l.id); A.beginNegotiation(s, l.id);
  l.neg.buyerMax = l.neg.ask; l.neg.offer = l.neg.ask; // force a close at ask
  const cash = s.player.cash;
  const out = A.negAccept(s, l.id);
  assert.equal(out.outcome, 'won'); assert.equal(out.deal.commission, 0);
  assert.equal(s.player.cash, cash + out.deal.price);
});
test('lost negotiation closes lead and counts', () => {
  const s = newGame('T', 31, '2026-10-05');
  const lead = s.leads[0];
  A.contactLead(s, lead.id); A.doVisit(s, lead.id); A.beginNegotiation(s, lead.id);
  const r = A.negWalk(s, lead.id);
  assert.equal(r.outcome, 'lost'); assert.equal(lead.status, 'lost'); assert.equal(s.stats.lost, 1);
});
test('1000 simulated weeks never break invariants', () => {
  const s = newGame('T', 2024, '2026-10-05');
  for (let i = 0; i < 1000; i++) {
    A.tick(s, '2026-10-05');
    for (const m of s.properties.filter((x) => x.status === 'market' && x.ask < 3e7)) { if (!A.takeListingAction(s, m.id).ok) break; }
    if (s.player.cash > 2e5 && s.business.office < 3) A.upgrade(s, 'office'); else if (s.player.cash > 3e5) { for (const u of ['marketing','service','sales']) A.upgrade(s, u); }
    for (const l of s.leads.filter((x) => x.status === 'new').slice(0, 2)) {
      A.contactLead(s, l.id); A.doVisit(s, l.id);
      if (A.beginNegotiation(s, l.id).ok) { let g = 0; while (l.neg.status === 'open' && g++ < 6) { const n = l.neg; if (n.offer >= n.floor && g > 2) A.negAccept(s, l.id); else A.negCounter(s, l.id, Math.max(n.floor, Math.round((n.offer + n.ask) / 2))); } }
    }
    assert.ok(Number.isFinite(s.player.cash) && s.player.cash >= 0, 'cash ' + s.player.cash);
    assert.ok(s.player.energy >= 0 && s.player.energy <= 10);
  }
  assert.ok(s.stats.deals > 0);
  console.log('sim 1000 weeks: deals', s.stats.deals, 'lost', s.stats.lost, 'cash', s.player.cash, 'level', s.player.level);
  assert.ok(s.properties.length < 5000);
});
