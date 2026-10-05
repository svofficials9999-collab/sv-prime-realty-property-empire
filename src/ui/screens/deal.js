import { btn, top, kv, empty } from '../components.js';
import { inr } from '../../util/money.js';
import { leadOf, propOf, custOf } from '../../state/selectors.js';
import { titleFor, xpNeeded } from '../../logic/xp.js';

export const deal = {
  render: (s, params) => {
    const l = leadOf(s, params.leadId); if (!l || !l.result) return top('Deal', 'leads') + empty('No result yet.');
    const p = propOf(s, l.propertyId); const c = custOf(s, l.customerId);
    if (l.result.kind === 'won') {
      const d = s.deals.find((x) => x.id === l.result.dealId);
      return `<div class="splash" style="justify-content:flex-start;padding-top:40px"><div class="logo">🏆</div><h1 class="green">Deal Won!</h1><p class="mut">${p.title} sold to ${c.name}</p>
      <div class="card" style="width:100%;text-align:left">${kv('Sale price', inr(d.price))}${d.own ? kv('Your property, full price received', inr(d.proceeds)) : kv(`Commission (${(d.rate * 100).toFixed(1)}%)`, `<b class="gold">${inr(d.commission)}</b>`)}${kv('XP earned', '+' + d.xp)}${kv('Level', `${s.player.level} · ${titleFor(s.player.level)}`)}${kv('Cash now', inr(s.player.cash))}${kv('Next level in', `${Math.max(0, xpNeeded(s.player.level) - s.player.xp)} XP`)}</div>
      ${d.levelUp ? '<div class="banner" style="width:100%">🎉 Level up!</div>' : ''}
      <div style="width:100%">${btn({ label: 'Spend it: Business upgrades', act: 'biz' })}${btn({ label: 'More leads', act: 'leads', kind: 'ghost' })}</div></div>`;
    }
    const why = { patience: 'The buyer lost patience.', walked: 'You walked away.', sold: 'The property was sold to someone else.', lost: 'No agreement reached.' }[l.result.reason] || 'No agreement reached.';
    return `<div class="splash" style="justify-content:flex-start;padding-top:40px"><div class="logo" style="background:#431a1c">🤝</div><h1 class="red">Deal Lost</h1><p class="mut">${why}</p>
    <div class="card mut" style="width:100%">Tip: counter closer to the buyer's offer early, and watch their patience. Match the area and type on visits.</div>
    <div style="width:100%">${btn({ label: 'Back to leads', act: 'leads' })}</div></div>`;
  },
  handlers: { biz: ({ go }) => go('business'), leads: ({ go }) => go('leads') },
};
