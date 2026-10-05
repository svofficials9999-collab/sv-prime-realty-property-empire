import { btn, top, bar, kv } from '../components.js';
import { inr } from '../../util/money.js';
import { UPGRADES } from '../../data/upgrades.js';
import { upgradeCost, lvl } from '../../logic/upgrades.js';
import { B } from '../../config/balance.js';
import { dispatch } from '../../state/store.js';
import { upgrade } from '../../state/actions.js';

export const business = {
  render: (s) => `${top('Business')}<div class="mut" style="margin-bottom:8px">Spend commission to grow. Each track has ${B.upgradeMax} levels.</div>
  ${UPGRADES.map((u) => {
    const l = lvl(s, u.id); const max = l >= B.upgradeMax; const cost = upgradeCost(u.id, l);
    const pips = Array.from({ length: B.upgradeMax }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('');
    return `<div class="card"><div class="row"><div class="pi">${u.icon}</div><div class="col" style="flex:1"><b>${u.name}</b><span class="mut">${u.effect}</span><span class="mut">${u.per}</span></div></div>
    <div class="row" style="margin-top:8px"><div class="pips">${pips}</div><span class="mut">Level ${l} / ${B.upgradeMax}</span></div>
    ${max ? '<div class="why">Maxed out</div>' : btn({ label: `Upgrade · ${inr(cost)}`, act: 'up', arg: u.id, disabled: s.player.cash < cost, reason: `Need ${inr(cost)}. You have ${inr(s.player.cash)}.` })}</div>`;
  }).join('')}
  <div class="card tap" data-act="staff"><div class="row"><div class="pi">👥</div><div class="col" style="flex:1"><b>Staff</b><span class="mut">Hire a team for passive bonuses · ${Object.keys(s.staff || {}).length} hired</span></div><span class="mut">→</span></div></div>
  <div class="card tap" data-act="garage"><div class="row"><div class="pi">🚗</div><div class="col" style="flex:1"><b>Vehicles</b><span class="mut">Better site visits and far areas · ${(s.garage || []).length} owned</span></div><span class="mut">→</span></div></div>`,
  handlers: {
    staff: ({ go }) => go('staff'), garage: ({ go }) => go('garage'), up: ({ arg, toast }) => { const r = dispatch(upgrade, arg); toast(r.ok ? `Upgraded to level ${r.level}.` : r.msg, !r.ok); } },
};
export { bar, kv };
