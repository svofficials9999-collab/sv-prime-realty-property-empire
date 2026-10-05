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
