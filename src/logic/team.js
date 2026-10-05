import { STAFF, VEHICLES, HIRE_WEEKS } from '../data/team.js';

export const staffOf = (s) => s.staff || {};
export const garageOf = (s) => s.garage || [];
export const staffSlots = (s) => 1 + Math.floor(s.player.level / 3);
export const hiredIds = (s) => STAFF.filter((d) => staffOf(s)[d.id]).map((d) => d.id);
export const salaryMult = (s) => (staffOf(s).accountant ? 0.85 : 1);
export const salaryOf = (s, id) => Math.round(STAFF.find((d) => d.id === id).weekly * salaryMult(s));
export const weeklyPayroll = (s) => hiredIds(s).reduce((a, id) => a + salaryOf(s, id), 0);
export const hireFee = (id) => STAFF.find((d) => d.id === id).weekly * HIRE_WEEKS;
// Staff only work in a week their salary was paid.
export const active = (s, id) => !!staffOf(s)[id] && !s.unpaid;
export const bestVehicle = (s) => VEHICLES.filter((v) => garageOf(s).includes(v.id)).reduce((m, v) => (v.tier > (m ? m.tier : 0) ? v : m), null);
export const vehicleTier = (s) => (bestVehicle(s) ? bestVehicle(s).tier : 0);
export const visitBonus = (s) => (bestVehicle(s) ? bestVehicle(s).visit : 0) + (active(s, 'visitexec') ? 6 : 0);

export function hireStaff(s, id) {
  const d = STAFF.find((x) => x.id === id);
  if (!d) return { ok: false, msg: 'Unknown role' };
  if (!s.staff) s.staff = {};
  if (s.staff[id]) return { ok: false, msg: 'Already hired' };
  if (hiredIds(s).length >= staffSlots(s)) return { ok: false, msg: 'No free staff slot. Slots grow with your level.' };
  const fee = hireFee(id);
  if (s.player.cash < fee) return { ok: false, msg: 'Not enough cash' };
  s.player.cash -= fee;
  s.staff[id] = { since: s.week };
  return { ok: true, fee };
}
export function fireStaff(s, id) {
  if (!s.staff || !s.staff[id]) return { ok: false, msg: 'Not hired' };
  delete s.staff[id];
  return { ok: true };
}
export function buyVehicle(s, id) {
  const v = VEHICLES.find((x) => x.id === id);
  if (!v) return { ok: false, msg: 'Unknown vehicle' };
  if (!s.garage) s.garage = [];
  if (s.garage.includes(id)) return { ok: false, msg: 'Already owned' };
  if (s.player.level < v.minLevel) return { ok: false, msg: `Unlocks at level ${v.minLevel}` };
  if (s.player.cash < v.price) return { ok: false, msg: 'Not enough cash' };
  s.player.cash -= v.price;
  s.garage.push(id);
  return { ok: true, v };
}
// Called once per game week. Pays salaries when cash allows; otherwise staff pause (cash never goes negative).
export function payStaff(s) {
  const due = weeklyPayroll(s);
  s.unpaid = false;
  if (!due) return 0;
  if (s.player.cash >= due) { s.player.cash -= due; return due; }
  s.unpaid = true;
  return 0;
}
