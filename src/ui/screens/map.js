import { top, bar, chip } from '../components.js';
import { LOCATIONS, locById } from '../../config/locations.js';
import { TYPES } from '../../data/propertyTypes.js';
import { NODES, ROADS, STATUS, statusOf } from '../../data/mapLayout.js';
import { inr, inrShort } from '../../util/money.js';
import { demandOf, ppsyOf, unlocked } from '../../logic/market.js';
import { dispatch } from '../../state/store.js';

const propsIn = (s, id) => s.properties.filter((p) => p.location === id && statusOf(p));
const lockText = (s, l) => (l.minLevel > s.player.level ? `Unlocks at level ${l.minLevel}` : `Needs ${l.minVehicle >= 2 ? 'an SUV' : 'a car'} (Business → Vehicles)`);

function svg(s, sel) {
  const open = new Set(unlocked(s).map((l) => l.id));
  const roads = ROADS.map(([a, b]) => `<line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="${open.has(a) && open.has(b) ? '#3a5a8c' : '#26364f'}" stroke-width="3" stroke-linecap="round" ${open.has(a) && open.has(b) ? '' : 'stroke-dasharray="5 5"'}/>`).join('');
  const nodes = LOCATIONS.map((l) => {
    const [x, y] = NODES[l.id]; const isOpen = open.has(l.id); const on = sel === l.id;
    const pins = isOpen ? propsIn(s, l.id).slice(0, 12).map((p, i, arr) => {
      const a = (Math.PI * 2 * i) / Math.max(arr.length, 1) - Math.PI / 2;
      return `<circle cx="${(x + Math.cos(a) * 25).toFixed(1)}" cy="${(y + Math.sin(a) * 25).toFixed(1)}" r="4.5" fill="${STATUS[statusOf(p)].color}" stroke="#0b1a33" stroke-width="1.2"/>`;
    }).join('') : '';
    return `<g data-act="sel" data-arg="${l.id}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="38" fill="transparent"/>${pins}
      <circle cx="${x}" cy="${y}" r="15" fill="${isOpen ? '#16316e' : '#1a2438'}" stroke="${on ? '#f6d36a' : isOpen ? '#6f9cff' : '#3a465c'}" stroke-width="${on ? 3.5 : 2}"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="#fff">${isOpen ? '📍' : '🔒'}</text>
      <text x="${x}" y="${y + 40}" text-anchor="middle" font-size="11" font-weight="${on ? 700 : 500}" fill="${on ? '#f6d36a' : isOpen ? '#dbe6ff' : '#7d8aa3'}">${l.name}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 360 320" width="100%" role="img" aria-label="Schematic map of Hyderabad areas" style="display:block;background:#0b1a33;border-radius:12px;border:1px solid #1d3a6a">${roads}${nodes}</svg>`;
}
function panel(s, id) {
  const l = locById(id); const open = unlocked(s).some((x) => x.id === id);
  if (!open) return `<div class="card lock"><b>🔒 ${l.name}</b><div class="mut" style="margin-top:4px">${lockText(s, l)}</div></div>`;
  const ps = propsIn(s, id); const m = s.market.loc[id]; const tr = m.trend;
  const ev = s.market.events.find((e) => e.loc === id);
  const cnt = (k) => ps.filter((p) => statusOf(p) === k).length;
  const chipsRow = ['available', 'listed', 'owned', 'sold'].map((k) => `<span class="chip ${STATUS[k].chip}">${STATUS[k].label} ${cnt(k)}</span>`).join(' ');
  const cats = {}; ps.filter((p) => p.status === 'market').forEach((p) => { cats[p.type] = (cats[p.type] || 0) + 1; });
  const catRow = Object.keys(cats).map((t) => `<span class="chip">${TYPES[t].icon} ${TYPES[t].label} ${cats[t]}</span>`).join(' ');
  const rows = ps.sort((a, b) => a.ask - b.ask).slice(0, 12).map((p) => `<div class="row tap" data-act="open" data-arg="${p.id}" style="padding:8px 0;border-top:1px solid #1d3a6a;gap:8px"><div class="pi">${TYPES[p.type].icon}</div><div class="col" style="flex:1;min-width:0"><b>${TYPES[p.type].label}</b><span class="mut">${p.area} ${p.unit}</span></div><div class="col" style="text-align:right"><b class="gold">${inrShort(p.ask)}</b><span><span class="chip ${STATUS[statusOf(p)].chip}">${STATUS[statusOf(p)].label}</span></span></div></div>`).join('');
  return `<div class="card"><div class="row"><b class="big">${l.name}</b><span>${tr > 0 ? '<span class="green">▲ rising</span>' : tr < 0 ? '<span class="red">▼ falling</span>' : '<span class="mut">● steady</span>'}</span></div>
    <div class="row mut" style="margin-top:6px"><span>Avg ${inr(ppsyOf(s, id))}/sq yd</span><span>Yield ${l.yield}%</span></div>
    <div class="row mut" style="margin:6px 0 4px"><span>Demand ${demandOf(s, id)} / 100</span><span>${ps.length} properties</span></div>${bar(demandOf(s, id))}
    ${ev ? `<div class="why gold">📈 ${ev.text}</div>` : ''}
    <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">${chipsRow}</div>
    ${catRow ? `<div class="why" style="margin-top:8px">Available now</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${catRow}</div>` : ''}
    ${rows ? `<div style="margin-top:8px">${rows}</div>` : '<div class="why" style="margin-top:8px">No properties here right now. New ones arrive as weeks pass.</div>'}
    <button class="btn" data-act="area" data-arg="${id}" style="margin-top:10px">Open in Marketplace</button></div>`;
}
export const map = {
  render: (s) => {
    const open = unlocked(s);
    const sel = s.ui.mapSel && locById(s.ui.mapSel) ? s.ui.mapSel : (open[0] || LOCATIONS[0]).id;
    const legend = ['available', 'listed', 'owned', 'sold'].map((k) => `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px"><i style="width:10px;height:10px;border-radius:50%;background:${STATUS[k].color};display:inline-block"></i>${STATUS[k].label}</span>`).join('');
    return `${top('Hyderabad Map')}<div class="mut" style="margin-bottom:8px">Tap an area. Dots around it are properties. Roads join nearby areas (dashed = locked). Schematic map, not to scale.</div>
    ${svg(s, sel)}<div class="mut" style="margin:8px 0 10px">${legend}</div>${panel(s, sel)}`;
  },
  handlers: {
    sel: ({ arg }) => { dispatch((st) => { st.ui.mapSel = arg; return {}; }); },
    open: ({ arg, go }) => go('property', { id: arg }),
    area: ({ arg, go }) => { dispatch((st) => { st.ui.pf = { loc: arg, type: '' }; return {}; }); go('properties'); },
  },
};
export { chip };
