// Single source of truth. Reducers (actions.js) mutate the one state object; the store
// then notifies the UI and schedules an autosave.
import { syncLeads } from '../logic/leads.js';
let state = null;
let saver = () => {};
let timer = null;
const subs = new Set();
export const getState = () => state;
export function setState(s) { state = s; notify(); }
export function configure({ save }) { saver = save; }
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
function notify() { for (const f of subs) f(state); }
export function flush() { clearTimeout(timer); timer = null; if (state) saver(state); }
export function dispatch(fn, ...args) {
  const r = fn(state, ...args);
  syncLeads(state);
  notify();
  clearTimeout(timer);
  timer = setTimeout(flush, 300);
  return r;
}
