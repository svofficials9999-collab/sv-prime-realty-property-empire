import { TITLES } from '../config/constants.js';
export const xpNeeded = (level) => Math.round(100 * Math.pow(level, 1.5));
export function titleFor(level) {
  let t = TITLES[0][1];
  for (const [lv, name] of TITLES) if (level >= lv) t = name;
  return t;
}
export function nextTitle(level) {
  return TITLES.find(([lv]) => lv > level) || null;
}
// Adds XP, handles level-ups. Returns number of levels gained.
export function addXp(state, amount) {
  const p = state.player;
  p.xp += Math.max(0, Math.round(amount));
  let gained = 0;
  while (p.xp >= xpNeeded(p.level)) {
    p.xp -= xpNeeded(p.level);
    p.level += 1;
    gained += 1;
  }
  return gained;
}
