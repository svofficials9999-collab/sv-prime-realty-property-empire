// Seeded RNG whose state lives in game state (s.rng) so saves replay identically.
export function nextRand(s) {
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const makeRand = (s) => () => nextRand(s);
export const pick = (r, a) => a[Math.floor(r() * a.length)];
export const between = (r, a, b) => a + (b - a) * r();
export const int = (r, a, b) => Math.floor(a + (b - a + 1) * r());
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let n = 0;
export const uid = (p) => p + (++n).toString(36) + Math.floor(Math.random() * 1e6).toString(36);
