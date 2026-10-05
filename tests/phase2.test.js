import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../src/state/newGame.js';
import * as A from '../src/state/actions.js';
import { parse, serialize } from '../src/services/storage.js';
import { hireStaff, buyVehicle, weeklyPayroll, staffSlots } from '../src/logic/team.js';
import { unlocked } from '../src/logic/market.js';
import { leadChance, commissionRate } from '../src/logic/upgrades.js';

test('old save without staff/garage migrates add-only', () => {
  const s = newGame('T', 7, 1); delete s.staff; delete s.garage; s.player.cash = 123456;
  const m = parse(serialize(s));
  assert.deepEqual(m.staff, {}); assert.deepEqual(m.garage, []); assert.equal(m.player.cash, 123456);
});
test('no staff/vehicles: numbers unchanged', () => {
  const s = newGame('T', 7, 1);
  assert.equal(leadChance(s), 0.35); assert.equal(commissionRate(s), 0.02);
});
test('hire: slots, fee, salary, effect, cash never negative', () => {
  const s = newGame('T', 7, 1); s.player.cash = 1000000;
  assert.equal(staffSlots(s), 1);
  const r = hireStaff(s, 'marketer'); assert.ok(r.ok); assert.equal(s.player.cash, 1000000 - 20000);
  assert.equal(hireStaff(s, 'sales').ok, false);
  assert.ok(Math.abs(leadChance(s) - 0.41) < 1e-9);
  assert.equal(weeklyPayroll(s), 2500);
  const c = s.player.cash; A.tick(s, 1); assert.equal(s.player.cash <= c, true);
  s.player.cash = 100; A.tick(s, 1); assert.equal(s.unpaid, true); assert.ok(s.player.cash >= 0);
  assert.equal(leadChance(s), 0.35);
});
test('vehicle gating and far areas', () => {
  const s = newGame('T', 7, 1); s.player.level = 8; s.player.cash = 9e6;
  assert.equal(unlocked(s).some((l) => l.id === 'sangareddy'), false);
  assert.equal(buyVehicle(newGame('T', 7, 1), 'car').ok, false);
  assert.ok(buyVehicle(s, 'car').ok); assert.equal(buyVehicle(s, 'car').ok, false);
  assert.equal(unlocked(s).some((l) => l.id === 'sangareddy'), true);
  assert.equal(unlocked(s).some((l) => l.id === 'fd'), false);
});

import { validateImport, exportText } from '../src/services/backup.js';
import { createProperty } from '../src/logic/properties.js';
import { TYPES, TYPE_IDS } from '../src/data/propertyTypes.js';
import { makeRand } from '../src/util/rng.js';
import { help } from '../src/ui/screens/help.js';
import { map } from '../src/ui/screens/map.js';
import { staff, garage } from '../src/ui/screens/team.js';
import { settings } from '../src/ui/screens/profile.js';

test('stage 2: new types exist, farm only in far areas, prices sane', () => {
  for (const t of ['bhk1', 'luxvilla', 'farm', 'office', 'shop', 'plot']) assert.ok(TYPES[t]);
  assert.equal(TYPES.shop.label, 'Commercial Property');
  const s = newGame('T', 11, 1); const r = makeRand(s);
  const seen = {};
  for (let i = 0; i < 600; i++) {
    s.player.level = 12; s.garage = ['car', 'suv'];
    const p = createProperty(s, r); seen[p.type] = (seen[p.type] || 0) + 1;
    assert.ok(p.ask > 100000 && p.ask < 2e9, p.type + ' ' + p.ask);
    if (p.type === 'farm') assert.ok(['tellapur', 'sangareddy'].includes(p.location));
  }
  for (const t of TYPE_IDS) assert.ok(seen[t] > 0, 'never spawned ' + t);
});
test('old-type deals keep exact numbers; new types change commission/xp', async () => {
  const { closeDeal } = await import('../src/logic/deals.js');
  const { createLead } = await import('../src/logic/leads.js');
  const mk = (type) => {
    const s = newGame('T', 5, 1); const r = makeRand(s);
    const p = createProperty(s, r, { type, location: 'kukatpally' }); p.status = 'listed'; s.properties.push(p);
    const l = createLead(s, r, p, true); l.neg = { price: 10000000, status: 'won' };
    return closeDeal(s, l);
  };
  const a = mk('bhk2'); assert.equal(a.commission, 200000); assert.equal(a.xp, 50 + 20);
  const b = mk('luxvilla'); assert.equal(b.commission, 230000); assert.equal(b.xp, 50 + 23 + 15);
  const c = mk('farm'); assert.equal(c.commission, 180000);
});
test('import validation rejects bad files, accepts exports and raw saves', () => {
  const s = newGame('T', 3, 1);
  assert.equal(validateImport('hello').ok, false);
  assert.equal(validateImport('{}').ok, false);
  assert.equal(validateImport('').ok, false);
  const good = exportText(s); assert.equal(validateImport(good).ok, true);
  const o = JSON.parse(good); o.sum = 1; assert.equal(validateImport(JSON.stringify(o)).ok, false);
  assert.equal(validateImport(JSON.stringify(s)).ok, true); // old "Copy save" raw format
  const bad = JSON.parse(JSON.stringify(s)); bad.player.cash = 'lots'; assert.equal(validateImport(JSON.stringify(bad)).ok, false);
  const bad2 = JSON.parse(JSON.stringify(s)); bad2.properties[0].type = 'spaceship'; assert.equal(validateImport(JSON.stringify(bad2)).ok, false);
  const v = validateImport(JSON.stringify(Object.assign(JSON.parse(JSON.stringify(s)), { staff: undefined, garage: undefined })));
  assert.deepEqual(v.state.garage, []);
});
test('stage 2 screens render', () => {
  const s = newGame('T', 3, 1);
  for (const [n, sc] of Object.entries({ help, map, staff, garage, settings })) { const h = sc.render(s, {}); assert.ok(h.length > 100 && !/undefined|NaN|\[object/.test(h), n); }
});
