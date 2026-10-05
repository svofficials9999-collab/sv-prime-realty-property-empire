import { btn, chip, top, kv, bar, empty } from '../components.js';
import { leadOf, custOf, propOf } from '../../state/selectors.js';
import { dispatch } from '../../state/store.js';
import { beginNegotiation } from '../../state/actions.js';

const OUT = { liked: ['Liked it 😍', 'green'], neutral: ['Neutral 🙂', 'gold'], disliked: ['Disliked 😕', 'red'] };
export const visit = {
  render: (s, params) => {
    const l = leadOf(s, params.leadId); if (!l || !l.visit) return top('Site Visit', 'leads') + empty('No visit yet. Contact the customer and schedule one.');
    const v = l.visit; const c = custOf(s, l.customerId); const p = propOf(s, l.propertyId); const [lb, k] = OUT[v.outcome];
    const canNeg = l.status === 'visited' || l.status === 'negotiating';
    return `${top('Site Visit', 'customer')}
    <div class="card"><b>${p.title}</b><div class="mut">with ${c.name}</div></div>
    <div class="card"><div class="row"><b>Result</b>${chip(lb, k)}</div><p class="mut">${v.comment}</p>
    <div class="kv"><span>Visit score</span><span>${v.score} / 100</span></div>${bar(v.score)}</div>
    <div class="card"><b>Why</b>${kv('Location match', `${v.fit.loc} / 40`)}${kv('Property type match', `${v.fit.type} / 30`)}${kv('Budget fit', `${v.fit.budget} / 30`)}${kv('Customer satisfaction', c.satisfaction + '%')}</div>
    ${canNeg ? btn({ label: l.status === 'negotiating' ? 'Resume negotiation' : 'Start negotiation', act: 'neg', arg: l.id }) : btn({ label: 'Back to customer', act: 'back', kind: 'ghost' })}`;
  },
  handlers: {
    neg: ({ arg, toast, go }) => { const r = dispatch(beginNegotiation, arg); if (r.ok) go('negotiate', { leadId: arg }); else toast(r.msg, true); },
    back: ({ p, go }) => go('customer', { leadId: p.leadId }),
  },
};
