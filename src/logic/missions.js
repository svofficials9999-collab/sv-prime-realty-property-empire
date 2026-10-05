import { MISSIONS } from '../data/missions.js';
import { addXp } from './xp.js';

export function freshMissions(date) {
  return { date, items: MISSIONS.map((m) => ({ id: m.id, progress: 0, claimed: false })) };
}
export function ensureMissions(s, today) {
  if (!s.missions || s.missions.date !== today) s.missions = freshMissions(today);
}
export function track(s, kind, amount = 1) {
  for (const m of MISSIONS) {
    if (m.kind !== kind) continue;
    const it = s.missions.items.find((i) => i.id === m.id);
    if (it && !it.claimed) it.progress = Math.min(m.target, it.progress + amount);
  }
}
export const isDone = (s, id) => {
  const m = MISSIONS.find((x) => x.id === id);
  const it = s.missions.items.find((i) => i.id === id);
  return it.progress >= m.target;
};
export function claim(s, id) {
  const m = MISSIONS.find((x) => x.id === id);
  const it = s.missions.items.find((i) => i.id === id);
  if (!m || !it || it.claimed || it.progress < m.target) return { ok: false, msg: 'Mission not complete' };
  it.claimed = true;
  s.player.cash += m.cash; s.player.tokens += m.tokens;
  const levels = addXp(s, m.xp);
  return { ok: true, m, levels };
}
