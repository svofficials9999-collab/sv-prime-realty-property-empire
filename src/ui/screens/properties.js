import { btn, chip, top, kv, empty, bar } from '../components.js';
import { inr, inrShort } from '../../util/money.js';
import { LOCATIONS, locById } from '../../config/locations.js';
import { TYPES, TYPE_IDS } from '../../data/propertyTypes.js';
import { marketProps, propOf } from '../../state/selectors.js';
import { unlocked, demandOf, ppsyOf } from '../../logic/market.js';
import { slotsFree } from '../../logic/properties.js';
import { dispatch } from '../../state/store.js';
import { takeListingAction, buyPropertyAction, toggleForSaleAction, withdrawAction } from '../../state/actions.js';

export const card = (p, extra = '') => `<div class="card tap" data-act="open" data-arg="${p.id}"><div class="row"><div class="pi">${TYPES[p.type].icon}</div>
<div class="col" style="flex:1;min-width:0"><b>${p.title}</b><span class="mut">${p.area} ${p.unit}${p.rentWeekly ? ` · rent ${inrShort(p.rentWeekly)}/wk` : ''}</span></div>
<div class="col" style="text-align:right"><b class="gold">${inrShort(p.ask)}</b>${extra}</div></div></div>`;

export const properties = {
  render: (s, params) => {
    const f = s.ui.pf || { loc: '', type: '' };
    const ul = unlocked(s).map((l) => l.id);
    let list = marketProps(s).filter((p) => (!f.loc || p.location === f.loc) && (!f.type || p.type === f.type));
    list.sort((a, b) => a.ask - b.ask);
    return `${top('Marketplace')}
    <div class="row mut" style="margin-bottom:8px"><span>Free listing slots: <b class="gold">${slotsFree(s)}</b></span><span class="chip blue" data-act="mine">My properties →</span></div>
    <div class="chips">${chip('All areas', f.loc ? '' : 'on').replace('<span', '<span data-act="floc" data-arg=""')}${LOCATIONS.filter((l) => ul.includes(l.id)).map((l) => chip(l.name, f.loc === l.id ? 'on' : '').replace('<span', `<span data-act="floc" data-arg="${l.id}"`)).join('')}</div>
    <div class="chips">${chip('All types', f.type ? '' : 'on').replace('<span', '<span data-act="ftype" data-arg=""')}${TYPE_IDS.map((t) => chip(TYPES[t].label, f.type === t ? 'on' : '').replace('<span', `<span data-act="ftype" data-arg="${t}"`)).join('')}</div>
    ${list.length ? list.map((p) => card(p)).join('') : empty('No properties match. New ones arrive as weeks pass.')}`;
  },
  handlers: {
    open: ({ arg, go }) => go('property', { id: arg }),
    mine: ({ go }) => go('mine'),
    floc: ({ s, arg }) => { dispatch((st) => { st.ui.pf = { ...(st.ui.pf || {}), loc: arg }; return {}; }); },
    ftype: ({ s, arg }) => { dispatch((st) => { st.ui.pf = { ...(st.ui.pf || {}), type: arg }; return {}; }); },
  },
};
export const property = {
  render: (s, params) => {
    const p = propOf(s, params.id);
    if (!p) return top('Property', 'properties') + empty('This property is no longer available.');
    const t = TYPES[p.type]; const loc = locById(p.location);
    const leadsN = s.leads.filter((l) => l.propertyId === p.id && ['new', 'contacted', 'visited', 'negotiating'].includes(l.status)).length;
    let actions = '';
    if (p.status === 'market') {
      const noSlot = slotsFree(s) <= 0; const poor = s.player.cash < p.ask;
      actions = btn({ label: 'Take listing (free)', act: 'take', arg: p.id, disabled: noSlot, reason: 'No free listing slots. Upgrade your Office in Business.' }) +
        btn({ label: `Buy as investment · ${inrShort(p.ask)}`, act: 'buy', arg: p.id, kind: 'blue', disabled: poor, reason: `Need ${inr(p.ask)} cash. You have ${inr(s.player.cash)}.` }) +
        `<div class="why">Listing: you represent the owner and earn ${'commission'} when it sells. Buying: you own it, earn weekly rent and can sell later at full price.</div>`;
    } else if (p.status === 'listed') {
      actions = `<div class="card">${chip('Your listing', 'gold')} <span class="mut">${leadsN} open lead${leadsN === 1 ? '' : 's'}</span></div>` +
        btn({ label: 'Open leads', act: 'leads', kind: 'blue' }) + btn({ label: 'Withdraw listing', act: 'withdraw', arg: p.id, kind: 'ghost' });
    } else if (p.status === 'owned') {
      actions = `<div class="card">${chip('You own this', 'green')} <span class="mut">${p.forSale ? 'Listed for sale' : 'Earning rent'}</span></div>` +
        btn({ label: p.forSale ? 'Stop selling (keep renting)' : 'List for sale', act: 'sale', arg: p.id, kind: p.forSale ? 'ghost' : '' });
    } else actions = `<div class="card">${chip('Sold', 'blue')} <span class="mut">${inr(p.soldPrice || p.ask)}</span></div>`;
    return `${top(p.title, 'properties')}
    <div class="card"><div class="row"><div class="pi">${t.icon}</div><div class="col"><b class="big gold">${inr(p.ask)}</b><span class="mut">${t.label} · ${p.area} ${p.unit}</span></div></div></div>
    <div class="card">${kv('Location', loc.name)}${kv('Price in area', `${inr(ppsyOf(s, p.location))} / sq yd`)}${kv('Area demand', `${demandOf(s, p.location)} / 100`)}
    ${kv('Rental yield', p.yieldPct ? `${p.yieldPct}% a year` : 'No rent (land)')}${p.rentWeekly ? kv('Rent per week', inr(p.rentWeekly)) : ''}</div>${actions}`;
  },
  handlers: {
    take: ({ arg, toast }) => { const r = dispatch(takeListingAction, arg); toast(r.ok ? 'Added to your listings. Leads will come.' : r.msg, !r.ok); },
    buy: ({ arg, toast }) => { const r = dispatch(buyPropertyAction, arg); toast(r.ok ? 'Property bought. It now earns rent each week.' : r.msg, !r.ok); },
    sale: ({ arg, toast }) => { const r = dispatch(toggleForSaleAction, arg); toast(r.ok ? 'Updated.' : r.msg, !r.ok); },
    withdraw: ({ arg, toast, go }) => { const r = dispatch(withdrawAction, arg); if (r.ok) { toast('Listing withdrawn.'); go('properties'); } else toast(r.msg, true); },
    leads: ({ go }) => go('leads'),
  },
};
export { bar };
