import { btn, stat, bar, chip } from '../components.js';
import { inrShort } from '../../util/money.js';
import { xpNeeded, nextTitle, titleFor } from '../../logic/xp.js';
import { newLeadCount, activeLeads, weeklyRent, owned, listed } from '../../state/selectors.js';
import { MISSIONS } from '../../data/missions.js';
import { dispatch } from '../../state/store.js';
import { tick } from '../../state/actions.js';
import { today } from '../../services/clock.js';
import { slots } from '../../logic/upgrades.js';
import { listingCount } from '../../logic/properties.js';
import { locById } from '../../config/locations.js';

export const home = {
  render: (s) => {
    const p = s.player; const nl = newLeadCount(s); const al = activeLeads(s).length;
    const done = s.missions.items.filter((i) => i.claimed).length;
    const ready = MISSIONS.filter((m) => { const it = s.missions.items.find((i) => i.id === m.id); return it.progress >= m.target && !it.claimed; }).length;
    const nt = nextTitle(p.level);
    const ev = s.market.events[0];
    const hint = nl ? `You have ${nl} new lead${nl > 1 ? 's' : ''}. Open Leads to contact them.` : al ? 'Continue your active leads: site visit or negotiation.' : 'No leads yet. List more properties or advance the week.';
    return `<h1>Welcome, ${p.name}</h1><div class="mut">${titleFor(p.level)} · ${nt ? `next title ${nt[1]} at level ${nt[0]}` : 'top rank'}</div>
    <div class="card" style="margin-top:12px"><div class="row"><span>Level ${p.level}</span><span class="mut">${p.xp} / ${xpNeeded(p.level)} XP</span></div>${bar((p.xp / xpNeeded(p.level)) * 100)}</div>
    ${ev ? `<div class="banner">📈 ${ev.text}</div>` : ''}
    <div class="grid2">${stat('Cash', inrShort(p.cash))}${stat('Energy', `⚡ ${p.energy} / 10`)}${stat('Deals closed', s.stats.deals)}${stat('Weekly rent', inrShort(weeklyRent(s)))}</div>
    <div class="card" style="margin-top:10px"><b>Next step</b><div class="mut" style="margin:4px 0 0">${hint}</div>
    ${btn({ label: nl ? `Open ${nl} new lead${nl > 1 ? 's' : ''}` : 'Open Leads', act: 'goto', arg: 'leads' })}</div>
    <div class="grid2" style="margin-top:2px"><div>${btn({ label: `Missions ${done}/5${ready ? ' · claim!' : ''}`, act: 'goto', arg: 'missions', kind: 'blue' })}</div><div>${btn({ label: 'My Properties', act: 'goto', arg: 'mine', kind: 'ghost' })}</div></div>
    <div class="card" style="margin-top:12px"><div class="row"><span>Listing slots</span><span>${listingCount(s)} / ${slots(s)}</span></div>
    <div class="row mut" style="margin-top:6px"><span>Active leads ${al}</span><span>Week ${s.week}</span></div>
    ${btn({ label: 'Advance one week ▶', act: 'week', kind: 'ghost' })}
    <div class="why">Time also passes by itself every ~25 seconds. Advancing gives energy, rent and new leads.</div></div>
    <div style="display:flex;gap:8px"><div style="flex:1">${btn({ label: 'Profile', act: 'goto', arg: 'profile', kind: 'ghost' })}</div><div style="flex:1">${btn({ label: 'Settings', act: 'goto', arg: 'settings', kind: 'ghost' })}</div></div>`;
  },
  handlers: {
    goto: ({ arg, go }) => go(arg),
    week: ({ toast }) => { const r = dispatch(tick, today()); toast(`Week passed. Rent ${inrShort(r.rent)}, ${r.newLeads} new lead${r.newLeads === 1 ? '' : 's'}.`); },
  },
};
export { owned, listed, chip, locById };
