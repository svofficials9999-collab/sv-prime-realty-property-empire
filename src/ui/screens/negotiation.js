import { btn, top, chip, empty } from '../components.js';
import { inr, roundTo } from '../../util/money.js';
import { leadOf, custOf, propOf } from '../../state/selectors.js';
import { dispatch } from '../../state/store.js';
import { negCounter, negAccept, negWalk } from '../../state/actions.js';
import { canAccept } from '../../logic/negotiation.js';

const cur = (s, n) => Math.min(n.ask, Math.max(n.floor, s.ui.counter ?? n.ask));
export const negotiate = {
  render: (s, params) => {
    const l = leadOf(s, params.leadId);
    if (!l || !l.neg || l.neg.status !== 'open') return top('Negotiation', 'leads') + empty('No open negotiation.') + btn({ label: 'Back to leads', act: 'leads', kind: 'ghost' });
    const n = l.neg; const c = custOf(s, l.customerId); const p = propOf(s, l.propertyId);
    const price = cur(s, n); const d1 = roundTo(n.ask * 0.005, 5000) || 5000; const d2 = roundTo(n.ask * 0.02, 5000) || 20000;
    const hearts = '♥'.repeat(Math.max(0, n.patience)) + '<span style="opacity:.25">' + '♥'.repeat(Math.max(0, 5 - Math.max(0, n.patience))) + '</span>';
    const acc = canAccept(n);
    return `${top('Negotiation')}
    <div class="card"><b>${p.title}</b><div class="mut">${c.name} · ${c.archetypeLabel}</div></div>
    <div class="card">
      <div class="row"><span class="mut">Asking price</span><b>${inr(n.ask)}</b></div>
      <div class="row" style="margin-top:6px"><span class="mut">Buyer's offer</span><b class="gold big">${inr(n.offer)}</b></div>
      <div class="row" style="margin-top:6px"><span class="mut">Seller expects at least</span><b class="green">${inr(n.floor)}</b></div>
      <div class="row" style="margin-top:6px"><span class="mut">Buyer budget (stated)</span><b>${inr(c.budget)}</b></div>
      <div class="row" style="margin-top:6px"><span class="mut">Round ${n.round} / ${n.maxRounds}</span><span style="color:var(--red)">Patience ${hearts}</span></div></div>
    <div class="banner">${n.note}</div>
    <div class="card"><div class="mut">Your counter</div><div class="big gold" id="cv" style="text-align:center">${inr(price)}</div>
    <input type="range" data-input="slider" min="${n.floor}" max="${n.ask}" step="1000" value="${price}">
    <div class="grid2" style="grid-template-columns:repeat(4,1fr)"><button class="btn ghost sm" data-act="step" data-arg="${-d2}">−${d2 / 1000}k</button><button class="btn ghost sm" data-act="step" data-arg="${-d1}">−${d1 / 1000}k</button><button class="btn ghost sm" data-act="step" data-arg="${d1}">+${d1 / 1000}k</button><button class="btn ghost sm" data-act="step" data-arg="${d2}">+${d2 / 1000}k</button></div>
    ${btn({ label: 'Send counter offer', act: 'counter' })}</div>
    ${btn({ label: `Accept buyer's ${inr(n.offer)}`, act: 'accept', kind: 'blue', disabled: !acc, reason: "Buyer's offer is below what the seller expects." })}
    ${btn({ label: 'Walk away', act: 'walk', kind: 'danger' })}${btn({ label: 'Leave and resume later', act: 'leave', kind: 'ghost' })}
    <h2>History</h2><div class="hist">${n.history.map((h) => `<div><b>${h.by === 'buyer' ? 'Buyer' : 'You'}</b> ${h.accepted ? 'accepted' : 'offered'} ${inr(h.price)}</div>`).join('')}</div>`;
  },
  inputs: {
    slider: ({ s, el, root }) => { s.ui.counter = +el.value; root.querySelector('#cv').textContent = inr(+el.value); },
  },
  handlers: {
    leads: ({ go }) => go('leads'),
    leave: ({ p, go }) => go('customer', { leadId: p.leadId }),
    step: ({ s, p, arg, go }) => { const l = leadOf(s, p.leadId); dispatch((st) => { st.ui.counter = Math.min(l.neg.ask, Math.max(l.neg.floor, cur(st, l.neg) + +arg)); return {}; }); },
    counter: ({ s, p, toast, go }) => {
      const l = leadOf(s, p.leadId); const price = cur(s, l.neg);
      const r = dispatch(negCounter, p.leadId, price);
      afterAction(r, toast, go, p);
    },
    accept: ({ p, toast, go }) => afterAction(dispatch(negAccept, p.leadId), toast, go, p),
    walk: ({ p, toast, go }) => { if (confirm('Walk away and lose this deal?')) afterAction(dispatch(negWalk, p.leadId), toast, go, p); },
  },
};
function afterAction(r, toast, go, p) {
  if (!r.ok) return toast(r.msg || 'Not possible', true);
  if (r.outcome === 'won' || r.outcome === 'lost') { dispatch((st) => { delete st.ui.counter; return {}; }); go('deal', { leadId: p.leadId }); }
  else { dispatch((st) => { st.ui.counter = undefined; return {}; }); toast('Counter offer: the buyer moved. Your turn.'); }
}
export { chip };
