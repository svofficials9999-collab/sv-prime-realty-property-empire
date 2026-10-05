import { esc } from '../util/dom.js';
export const btn = ({ label, act, arg = '', kind = '', disabled = false, reason = '' }) =>
  `<button class="btn ${kind}" data-act="${act}" data-arg="${esc(arg)}" ${disabled ? 'disabled' : ''}>${label}</button>${disabled && reason ? `<div class="why">${esc(reason)}</div>` : ''}`;
export const chip = (t, k = '') => `<span class="chip ${k}">${t}</span>`;
export const bar = (pct) => `<div class="bar"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
export const stat = (label, value) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`;
export const kv = (k, v) => `<div class="kv"><span>${k}</span><span>${v}</span></div>`;
export const top = (title, back) => `<div class="top">${back ? `<button class="back" data-act="go" data-arg="${back}">←</button>` : ''}<h1>${title}</h1></div>`;
export const empty = (t) => `<div class="card mut" style="text-align:center">${t}</div>`;
