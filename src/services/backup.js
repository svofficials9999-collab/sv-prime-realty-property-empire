// Backup, export and import. Never overwrites a save without keeping a safety copy first.
import { SAVE_KEY, BACKUP_KEY } from '../config/constants.js';
import { serialize, parse, migrate } from './storage.js';
import { TYPES } from '../data/propertyTypes.js';
import { LOCATIONS } from '../config/locations.js';

export const MANUAL_KEY = 'svpe.save.v1.manual';
export const UNDO_KEY = 'svpe.save.v1.undo';
const num = (x) => typeof x === 'number' && Number.isFinite(x);
const arr = Array.isArray;

// Returns { ok:true, state } or { ok:false, msg }. Accepts the exported file text or a raw save object.
export function validateImport(text) {
  let o;
  try { o = JSON.parse(String(text || '').trim()); } catch { return { ok: false, msg: 'This is not a valid save file (could not read it).' }; }
  if (!o || typeof o !== 'object') return { ok: false, msg: 'This is not a valid save file.' };
  let st;
  if (typeof o.body === 'string' && 'sum' in o) {
    st = parse(JSON.stringify(o));
    if (!st) return { ok: false, msg: 'This save file is damaged (check failed). Nothing was changed.' };
  } else st = o;
  const bad = (m) => ({ ok: false, msg: `This save file is not usable: ${m}. Nothing was changed.` });
  if (!st.player || typeof st.player !== 'object') return bad('no player');
  const p = st.player;
  if (typeof p.name !== 'string' || !num(p.level) || !num(p.xp) || !num(p.cash) || p.level < 1 || p.xp < 0 || p.cash < 0) return bad('player numbers are wrong');
  if (!num(st.week) || st.week < 1) return bad('week is wrong');
  for (const k of ['properties', 'leads', 'customers', 'deals']) if (!arr(st[k])) return bad(`${k} missing`);
  if (!st.properties.length) return bad('no properties');
  if (!st.market || !st.market.loc || !arr(st.market.events)) return bad('market missing');
  for (const l of LOCATIONS) if (!st.market.loc[l.id]) return bad('market areas missing');
  if (!st.missions || !arr(st.missions.items)) return bad('missions missing');
  if (!st.business || typeof st.business !== 'object') return bad('business missing');
  if (!st.stats || typeof st.stats !== 'object') return bad('stats missing');
  for (const x of st.properties) if (!x || !TYPES[x.type] || !LOCATIONS.some((l) => l.id === x.location) || !num(x.ask)) return bad('a property is unreadable');
  for (const c of st.customers) if (!c || !TYPES[c.prefType] || !num(c.budget)) return bad('a customer is unreadable');
  const m = migrate(st);
  if (!m) return bad('could not upgrade it');
  return { ok: true, state: m };
}
export const exportText = (state) => serialize(state);
export const exportName = () => `svpe-save-${new Date().toISOString().slice(0, 10)}.json`;

function readInfo(raw) {
  if (!raw) return null;
  const s = parse(raw); if (!s) return null;
  return { raw, name: s.player.name, level: s.player.level, cash: s.player.cash, week: s.week, savedAt: s.savedAt || 0 };
}
export function restorePoints(store = globalThis.localStorage) {
  if (!store) return [];
  return [['auto', 'Automatic backup (the save before the last one)', BACKUP_KEY], ['manual', 'Manual backup (from Save now)', MANUAL_KEY], ['undo', 'Before the last import or restore', UNDO_KEY]]
    .map(([id, label, key]) => ({ id, label, key, info: readInfo(store.getItem(key)) })).filter((r) => r.info);
}
export function saveNow(state, store = globalThis.localStorage) {
  state.savedAt = Date.now();
  const prev = store.getItem(SAVE_KEY); if (prev) store.setItem(BACKUP_KEY, prev);
  const raw = serialize(state);
  store.setItem(SAVE_KEY, raw); store.setItem(MANUAL_KEY, raw);
  return state.savedAt;
}
// Keep the current save aside, then return true. Call before any overwrite.
export function keepSafetyCopy(state, store = globalThis.localStorage) {
  store.setItem(UNDO_KEY, state ? serialize(state) : (store.getItem(SAVE_KEY) || ''));
}
export function stateFromPoint(id, store = globalThis.localStorage) {
  const r = restorePoints(store).find((x) => x.id === id);
  return r ? parse(r.info.raw) : null;
}
