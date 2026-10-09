import { btn, top, kv, bar } from '../components.js';
import { inr } from '../../util/money.js';
import { titleFor, nextTitle, xpNeeded } from '../../logic/xp.js';
import { netWorth } from '../../state/selectors.js';
import { dispatch, setState, flush, getState } from '../../state/store.js';
import { setName } from '../../state/actions.js';
import { wipe } from '../../services/storage.js';
import { exportText, exportName, validateImport, restorePoints, saveNow, keepSafetyCopy, stateFromPoint } from '../../services/backup.js';
import { VERSION } from '../../config/constants.js';
import { esc } from '../../util/dom.js';

export const profile = {
  render: (s) => {
    const p = s.player; const nt = nextTitle(p.level);
    return `${top('Profile', 'home')}<div class="card"><div class="row"><div class="pi">👤</div><div class="col"><b class="big">${esc(p.name)}</b><span class="gold">${titleFor(p.level)}</span></div></div>
    <div class="row mut" style="margin-top:8px"><span>Level ${p.level}</span><span>${p.xp} / ${xpNeeded(p.level)} XP</span></div>${bar((p.xp / xpNeeded(p.level)) * 100)}
    ${nt ? `<div class="why">Next title: ${nt[1]} at level ${nt[0]}</div>` : ''}</div>
    <div class="card">${kv('Deals won', s.stats.deals)}${kv('Deals lost', s.stats.lost)}${kv('Total sales', inr(s.stats.sales))}${kv('Total earned', inr(s.stats.earned))}${kv('Net worth', inr(netWorth(s)))}${kv('Property tokens', s.player.tokens)}${kv('Week', s.week)}</div>`;
  },
};
export const settings = {
  render: (s) => {
    const pts = restorePoints();
    const when = (t) => (t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'not yet');
    return `${top('Settings', 'home')}<div class="card"><div class="mut" style="margin-bottom:6px">Your name</div><input type="text" id="nm" maxlength="24" value="${esc(s.player.name)}">${btn({ label: 'Save name', act: 'name' })}</div>
  <div class="card"><b>Save</b><div class="mut">Your game saves by itself after every action and when you leave the app. Last saved: <b class="gold">${when(s.savedAt)}</b></div>
  ${btn({ label: 'Save now', act: 'savenow' })}</div>
  <div class="card"><b>Back up</b><div class="mut">Download a backup file, or copy it as text. Keep it safe (WhatsApp to yourself, Drive, email). Use it to restore on this or a new phone.</div>
  ${btn({ label: 'Download backup file', act: 'download', kind: 'blue' })}${btn({ label: 'Copy backup text', act: 'copy', kind: 'ghost' })}</div>
  <div class="card"><b>Restore from a file or text</b><div class="mut">Your current save is kept aside first, so you can undo. A bad or damaged file is rejected and changes nothing.</div>
  ${btn({ label: 'Choose backup file', act: 'pickfile', kind: 'blue' })}
  <textarea id="paste" rows="3" placeholder="Or paste backup text here" style="width:100%;margin-top:8px;border-radius:10px;border:1px solid var(--line);background:#0b1a33;color:#fff;padding:8px"></textarea>${btn({ label: 'Restore from pasted text', act: 'pastein', kind: 'ghost' })}</div>
  <div class="card"><b>Restore points on this phone</b>${pts.length ? pts.map((r) => `<div style="margin-top:8px;border-top:1px solid #1d3a6a;padding-top:8px"><div>${r.label}</div><div class="mut">Level ${r.info.level} · ${inr(r.info.cash)} · Week ${r.info.week} · ${when(r.info.savedAt)}</div>${btn({ label: 'Restore this', act: 'restore', arg: r.id, kind: 'ghost' })}</div>`).join('') : '<div class="mut" style="margin-top:6px">None yet. They appear after you save.</div>'}</div>
  <div class="card">${btn({ label: 'Game guide · గేమ్ గైడ్', act: 'help', kind: 'ghost' })}</div>
  <div class="card"><b>Reset game</b><div class="mut">Deletes progress and starts over. A safety copy stays under Restore points until the next import.</div>${btn({ label: 'Reset save', act: 'reset', kind: 'danger' })}</div>
  <div class="card mut">SV PRIME REALTY: PROPERTY EMPIRE · v${VERSION}<br>Prices and events are in-game values for play, not real market data or legal advice.</div>`;
  },
  handlers: {
    name: ({ root, toast }) => { dispatch(setName, root.querySelector('#nm').value); toast('Name saved.'); },
    help: ({ go }) => go('help'),
    savenow: ({ toast }) => { try { saveNow(getState()); dispatch(() => ({})); toast('Saved.'); } catch { toast('Could not save (phone storage full or blocked).', true); } },
    download: ({ toast }) => {
      try {
        const st = getState(); saveNow(st);
        const url = URL.createObjectURL(new Blob([exportText(st)], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = exportName(); document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000); toast('Backup file downloaded.');
      } catch { toast('Download not allowed here. Use Copy backup text.', true); }
    },
    copy: async ({ toast }) => { try { await navigator.clipboard.writeText(exportText(getState())); toast('Backup text copied.'); } catch { toast('Copy not allowed here. Use Download.', true); } },
    pickfile: ({ toast }) => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,.txt,application/json,text/plain';
      inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return; if (f.size > 5e6) return toast('File is too big to be a save.', true); applyText(await f.text(), toast); };
      inp.click();
    },
    pastein: ({ root, toast }) => applyText(root.querySelector('#paste').value, toast),
    restore: ({ arg, toast }) => {
      const st = stateFromPoint(arg); if (!st) return toast('That restore point is not readable.', true);
      if (!confirm('Restore this backup? Your current progress is kept aside so you can undo.')) return;
      install(st);
    },
    reset: () => { if (confirm('Delete all progress and restart? A safety copy is kept under Restore points.')) { try { keepSafetyCopy(getState()); } catch {} wipe(); setState(null); location.reload(); } },
  },
};
function applyText(text, toast) {
  const r = validateImport(text);
  if (!r.ok) return toast(r.msg, true);
  const c = r.state;
  if (!confirm(`Restore this backup?\n${c.player.name} · Level ${c.player.level} · ${inr(c.player.cash)} · Week ${c.week}\nYour current progress is kept aside so you can undo.`)) return;
  install(c);
}
function install(next) {
  try { keepSafetyCopy(getState()); } catch {}
  next.nav = { route: 'home', params: {} };
  setState(next); flush(); setTimeout(() => location.reload(), 150);
}
export { flush };
