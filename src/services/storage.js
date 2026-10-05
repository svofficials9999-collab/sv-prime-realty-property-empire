import { SAVE_KEY, BACKUP_KEY, SAVE_VERSION } from '../config/constants.js';

const checksum = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return h >>> 0; };
export function serialize(state) {
  const body = JSON.stringify(state);
  return JSON.stringify({ v: SAVE_VERSION, sum: checksum(body), body });
}
export function parse(raw) {
  try {
    const o = JSON.parse(raw);
    if (!o || o.sum !== checksum(o.body)) return null;
    return migrate(JSON.parse(o.body));
  } catch { return null; }
}
export function migrate(s) {
  if (!s || typeof s !== 'object' || !s.player) return null;
  s.version = SAVE_VERSION;
  s.nav = s.nav || { route: 'home', params: {} };
  s.ui = s.ui || {};
  return s;
}
export function save(state, store = globalThis.localStorage) {
  state.savedAt = Date.now();
  const prev = store.getItem(SAVE_KEY);
  if (prev) store.setItem(BACKUP_KEY, prev);
  store.setItem(SAVE_KEY, serialize(state));
}
export function load(store = globalThis.localStorage) {
  const raw = store.getItem(SAVE_KEY);
  if (raw) { const s = parse(raw); if (s) return s; }
  const bak = store.getItem(BACKUP_KEY);
  return bak ? parse(bak) : null;
}
export const hasSave = (store = globalThis.localStorage) => !!(store.getItem(SAVE_KEY) || store.getItem(BACKUP_KEY));
export function wipe(store = globalThis.localStorage) { store.removeItem(SAVE_KEY); store.removeItem(BACKUP_KEY); }
