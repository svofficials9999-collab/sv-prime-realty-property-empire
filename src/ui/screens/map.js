import { top, bar, chip } from '../components.js';
import { LOCATIONS } from '../../config/locations.js';
import { inr } from '../../util/money.js';
import { demandOf, ppsyOf } from '../../logic/market.js';
import { dispatch } from '../../state/store.js';

export const map = {
  render: (s) => `${top('Hyderabad Map')}<div class="mut" style="margin-bottom:8px">Tap an area to see its properties. New areas unlock as you level up.</div>
  ${LOCATIONS.map((l) => {
    const open = l.minLevel <= s.player.level;
    const avail = s.properties.filter((p) => p.location === l.id && (p.status === 'market' || p.status === 'listed')).length;
    const tr = s.market.loc[l.id].trend; const ev = s.market.events.find((e) => e.loc === l.id);
    if (!open) return `<div class="card lock"><div class="row"><b>🔒 ${l.name}</b><span class="mut">Unlocks at level ${l.minLevel}</span></div></div>`;
    return `<div class="card tap" data-act="area" data-arg="${l.id}"><div class="row"><b>${l.name}</b><span>${tr > 0 ? '<span class="green">▲ rising</span>' : tr < 0 ? '<span class="red">▼ falling</span>' : '<span class="mut">● steady</span>'}</span></div>
    <div class="row mut" style="margin-top:6px"><span>Avg ${inr(ppsyOf(s, l.id))}/sq yd</span><span>Yield ${l.yield}%</span></div>
    <div class="row mut" style="margin:6px 0 4px"><span>Demand ${demandOf(s, l.id)}</span><span>${avail} available</span></div>${bar(demandOf(s, l.id))}${ev ? `<div class="why gold">📈 ${ev.text}</div>` : ''}</div>`;
  }).join('')}`,
  handlers: { area: ({ arg, go }) => { dispatch((st) => { st.ui.pf = { loc: arg, type: '' }; return {}; }); go('properties'); } },
};
export { chip };
