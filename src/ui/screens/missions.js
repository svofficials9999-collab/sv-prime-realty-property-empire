import { btn, top, bar } from '../components.js';
import { MISSIONS } from '../../data/missions.js';
import { inr, inrShort } from '../../util/money.js';
import { dispatch } from '../../state/store.js';
import { claimMission } from '../../state/actions.js';

export const missions = {
  render: (s) => `${top('Daily Missions', 'home')}<div class="mut" style="margin-bottom:8px">Resets every day.</div>
  ${MISSIONS.map((m) => {
    const it = s.missions.items.find((i) => i.id === m.id); const done = it.progress >= m.target;
    const fmt = (n) => (m.kind === 'sales' ? inrShort(n) : n);
    return `<div class="card"><div class="row"><b>${m.text}</b><span class="mut">${fmt(it.progress)} / ${fmt(m.target)}</span></div>${bar((it.progress / m.target) * 100)}
    <div class="mut" style="margin-top:6px">Reward: ${inr(m.cash)} · ${m.xp} XP${m.tokens ? ` · ${m.tokens} 🪙 token` : ''}</div>
    ${it.claimed ? '<div class="why green">Claimed ✓</div>' : btn({ label: 'Claim reward', act: 'claim', arg: m.id, disabled: !done, reason: 'Not finished yet.' })}</div>`;
  }).join('')}`,
  handlers: { claim: ({ arg, toast }) => { const r = dispatch(claimMission, arg); toast(r.ok ? `Reward claimed.${r.levels ? ' Level up!' : ''}` : r.msg, !r.ok); } },
};
