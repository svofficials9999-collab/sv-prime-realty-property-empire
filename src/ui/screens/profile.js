import { btn, top, kv, bar } from '../components.js';
import { inr } from '../../util/money.js';
import { titleFor, nextTitle, xpNeeded } from '../../logic/xp.js';
import { netWorth } from '../../state/selectors.js';
import { dispatch, setState, flush, getState } from '../../state/store.js';
import { setName } from '../../state/actions.js';
import { wipe } from '../../services/storage.js';
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
  render: (s) => `${top('Settings', 'home')}<div class="card"><div class="mut" style="margin-bottom:6px">Your name</div><input type="text" id="nm" maxlength="24" value="${esc(s.player.name)}">${btn({ label: 'Save name', act: 'name' })}</div>
  <div class="card"><b>Back up your save</b><div class="mut">Copies your save text to the clipboard.</div>${btn({ label: 'Copy save', act: 'copy', kind: 'ghost' })}</div>
  <div class="card"><b>Reset game</b><div class="mut">Deletes progress on this phone and starts over.</div>${btn({ label: 'Reset save', act: 'reset', kind: 'danger' })}</div>
  <div class="card mut">SV PRIME REALTY: PROPERTY EMPIRE · MVP v1.0<br>Prices and events are in-game values for play, not real market data or legal advice.</div>`,
  handlers: {
    name: ({ root, toast }) => { dispatch(setName, root.querySelector('#nm').value); toast('Name saved.'); },
    copy: async ({ toast }) => { try { await navigator.clipboard.writeText(JSON.stringify(getState())); toast('Save copied.'); } catch { toast('Copy not allowed here.', true); } },
    reset: ({ go }) => { if (confirm('Delete all progress and restart?')) { wipe(); setState(null); location.reload(); } },
  },
};
export { flush };
