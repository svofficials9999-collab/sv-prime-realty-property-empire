import { B } from '../config/balance.js';
import { UPGRADES } from '../data/upgrades.js';
import { active } from './team.js';
export const lvl = (s, id) => s.business[id] || 0;
export const slots = (s) => B.baseSlots + B.slotsPerOffice * lvl(s, 'office');
export const leadChance = (s) => B.leadChanceBase + B.leadChancePerMarketing * lvl(s, 'marketing') + (active(s, 'marketer') ? 0.06 : 0);
export const concedeBonus = (s) => 0.04 * lvl(s, 'sales') + (active(s, 'sales') ? 0.04 : 0);
export const budgetBonus = (s) => 0.03 * lvl(s, 'tech');
export const rentMult = (s) => 1 + 0.1 * lvl(s, 'propmgmt') + (active(s, 'propmgr') ? 0.08 : 0);
export const commissionRate = (s) => B.commissionBase + B.commissionPerCS * lvl(s, 'service') + (active(s, 'paperwork') ? 0.001 : 0);
export const upgradeCost = (id, level) => {
  const u = UPGRADES.find((x) => x.id === id);
  return Math.round((u.base * Math.pow(B.upgradeGrowth, level)) / 1000) * 1000;
};
export function buyUpgrade(s, id) {
  const level = lvl(s, id);
  if (level >= B.upgradeMax) return { ok: false, msg: 'Already at max level' };
  const cost = upgradeCost(id, level);
  if (s.player.cash < cost) return { ok: false, msg: 'Not enough cash' };
  s.player.cash -= cost;
  s.business[id] = level + 1;
  return { ok: true, cost, level: level + 1 };
}
