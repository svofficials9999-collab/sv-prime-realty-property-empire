import { btn, chip, top, empty, kv, bar } from '../components.js';
import { inr, inrShort } from '../../util/money.js';
import { TYPES } from '../../data/propertyTypes.js';
import { locById } from '../../config/locations.js';
import { propOf, custOf, leadOf, activeLeads, closedLeads } from '../../state/selectors.js';
import { dispatch } from '../../state/store.js';
import { contactLead, doVisit, beginNegotiation, boost } from '../../state/actions.js';
import { B } from '../../config/balance.js';
import { fitScore } from '../../logic/siteVisit.js';

const STATUS = { new: ['New', 'blue'], contacted: ['Contacted', 'gold'], visited: ['Visited', 'gold'], negotiating: ['Negotiating', 'gold'], won: ['Won', 'green'], lost: ['Lost', 'red'], expired: ['Expired', ''] };
const urg = (n) => (n >= 4 ? 'High' : n >= 3 ? 'Medium' : 'Low');

export const leads = {
  render: (s) => {
    const tab = s.ui.lt || 'new';
    const lists = { new: s.leads.filter((l) => l.status === 'new'), active: activeLeads(s), closed: closedLeads(s).slice().reverse() };
    const items = lists[tab].map((l) => {
      const c = custOf(s, l.customerId); const p = propOf(s, l.propertyId);
      const [lb, k] = STATUS[l.status];
      return `<div class="card tap" data-act="open" data-arg="${l.id}"><div class="row"><div class="col" style="min-width:0"><b>${c.name}</b><span class="mut">${c.archetypeLabel} · ${p.title}</span><span class="mut">Budget ${inrShort(c.budget)} · urgency ${urg(c.urgency)}</span></div>
      <div class="col" style="text-align:right;align-items:flex-end">${chip(lb, k)}${['new', 'contacted', 'visited'].includes(l.status) ? `<span class="mut">${Math.max(0, l.expiresWeek - s.week)}w left</span>` : ''}</div></div></div>`;
    }).join('');
    const tabs = [['new', 'New'], ['active', 'Active'], ['closed', 'Closed']].map(([id, lb]) => `<span class="chip ${tab === id ? 'on' : ''}" data-act="tab" data-arg="${id}">${lb} (${lists[id].length})</span>`).join('');
    return `${top('Leads')}<div class="chips">${tabs}</div>${items || empty(tab === 'new' ? 'No new leads. Leads arrive each week for your listings.' : 'Nothing here yet.')}
    ${btn({ label: `Boost leads · 1 🪙 token (you have ${s.player.tokens})`, act: 'boost', kind: 'ghost', disabled: s.player.tokens < 1, reason: 'Earn property tokens from missions.' })}`;
  },
  handlers: {
    tab: ({ arg }) => dispatch((st) => { st.ui.lt = arg; return {}; }),
    open: ({ arg, go }) => go('customer', { leadId: arg }),
    boost: ({ toast }) => { const r = dispatch(boost); toast(r.ok ? `${B.boostLeads} hot leads arrived.` : r.msg, !r.ok); },
  },
};
export const customer = {
  render: (s, params) => {
    const l = leadOf(s, params.leadId); if (!l) return top('Customer', 'leads') + empty('Lead not found.');
    const c = custOf(s, l.customerId); const p = propOf(s, l.propertyId); const [lb, k] = STATUS[l.status];
    const fit = fitScore(c, p);
    let act = '';
    const noE = (n) => s.player.energy < n;
    if (l.status === 'new') act = btn({ label: `Contact customer (${B.contactEnergy}⚡)`, act: 'contact', arg: l.id, disabled: noE(B.contactEnergy), reason: 'Not enough energy. Advance a week on Home.' });
    else if (l.status === 'contacted') act = btn({ label: `Schedule site visit (${B.visitEnergy}⚡)`, act: 'visit', arg: l.id, disabled: noE(B.visitEnergy), reason: 'Not enough energy. Advance a week on Home.' });
    else if (l.status === 'visited') act = btn({ label: 'Start negotiation', act: 'neg', arg: l.id }) + btn({ label: 'View site visit result', act: 'seeVisit', arg: l.id, kind: 'ghost' });
    else if (l.status === 'negotiating') act = btn({ label: 'Resume negotiation', act: 'neg', arg: l.id });
    else if (l.status === 'won') act = btn({ label: 'View deal', act: 'seeDeal', arg: l.id });
    else act = `<div class="card mut">${l.status === 'expired' ? 'This lead went cold and expired.' : 'This lead is closed.'}</div>`;
    const mood = c.satisfaction;
    return `${top(c.name, 'leads')}
    <div class="card"><div class="row"><div class="pi">👤</div><div class="col" style="flex:1"><b>${c.name}</b><span class="mut">${c.archetypeLabel} · via ${l.source}</span></div>${chip(lb, k)}</div></div>
    <div class="card">${kv('Budget', inr(c.budget))}${kv('Wants', `${TYPES[c.prefType].label} in ${locById(c.prefLocation).name}`)}${kv('Urgency', `${c.urgency} / 5`)}${kv('Negotiation skill', `${c.skill} / 5`)}${kv('Risk level', `${c.risk} / 5`)}
    <div class="kv"><span>Satisfaction</span><span>${mood}%</span></div>${bar(mood)}</div>
    <div class="card"><b>Interested in</b><div class="mut">${p.title} · asking ${inr(p.ask)}</div>${kv('Match with this property', `${fit.total} / 100`)}</div>${act}`;
  },
  handlers: {
    contact: ({ arg, toast }) => { const r = dispatch(contactLead, arg); toast(r.msg, !r.ok); },
    visit: ({ arg, toast, go }) => { const r = dispatch(doVisit, arg); toast(r.msg, !r.ok); if (r.ok) go('visit', { leadId: arg }); },
    seeVisit: ({ arg, go }) => go('visit', { leadId: arg }),
    neg: ({ arg, toast, go }) => { const r = dispatch(beginNegotiation, arg); if (r.ok) go('negotiate', { leadId: arg }); else toast(r.msg, true); },
    seeDeal: ({ arg, go }) => go('deal', { leadId: arg }),
  },
};
