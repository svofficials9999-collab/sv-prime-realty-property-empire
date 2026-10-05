import { btn, top, chip } from '../components.js';
import { inr } from '../../util/money.js';
import { STAFF, VEHICLES, HIRE_WEEKS } from '../../data/team.js';
import { staffOf, staffSlots, hiredIds, salaryOf, weeklyPayroll, hireFee, garageOf, bestVehicle } from '../../logic/team.js';
import { dispatch } from '../../state/store.js';
import { hire, fire, buyCar } from '../../state/actions.js';

export const staff = {
  render: (s) => {
    const used = hiredIds(s).length; const slots = staffSlots(s);
    return `${top('Staff', 'business')}
    <div class="card"><div class="row"><span>Staff slots</span><b class="gold">${used} / ${slots}</b></div>
    <div class="row mut" style="margin-top:6px"><span>Salary per week</span><span>${inr(weeklyPayroll(s))}</span></div>
    <div class="why">A new slot opens every 3 levels. Hiring costs ${HIRE_WEEKS} weeks of salary once. Salary is paid each game week. If cash is short, staff pause that week. They never push your cash below zero.</div>
    ${s.unpaid ? '<div class="why red">Salary was not paid last week. Staff are paused until you have enough cash.</div>' : ''}</div>
    ${STAFF.map((d) => {
      const on = !!staffOf(s)[d.id]; const full = used >= slots; const fee = hireFee(d.id); const poor = s.player.cash < fee;
      return `<div class="card"><div class="row"><div class="pi">${d.icon}</div><div class="col" style="flex:1"><b>${d.name}</b><span class="mut">${d.effect}</span><span class="mut">${d.per} · ${inr(salaryOf(s, d.id))}/wk</span></div>${on ? chip('Hired', 'green') : ''}</div>
      ${on ? btn({ label: 'Let go', act: 'fire', arg: d.id, kind: 'ghost' })
        : btn({ label: `Hire · ${inr(fee)}`, act: 'hire', arg: d.id, disabled: full || poor, reason: full ? 'No free staff slot. Slots grow with your level.' : `Need ${inr(fee)}. You have ${inr(s.player.cash)}.` })}</div>`;
    }).join('')}`;
  },
  handlers: {
    hire: ({ arg, toast }) => { const r = dispatch(hire, arg); toast(r.ok ? 'Hired.' : r.msg, !r.ok); },
    fire: ({ arg, toast }) => { const r = dispatch(fire, arg); toast(r.ok ? 'Staff member let go. No refund.' : r.msg, !r.ok); },
  },
};
export const garage = {
  render: (s) => {
    const own = garageOf(s); const best = bestVehicle(s);
    return `${top('Vehicles', 'business')}
    <div class="card"><div class="row"><span>Best vehicle</span><b class="gold">${best ? best.name : 'None'}</b></div>
    <div class="why">A better vehicle raises your site visit score. A car opens Tellapur and Sangareddy, and an SUV opens Financial District (you also need the area level). One time cost, no running cost.</div></div>
    ${VEHICLES.map((v) => {
      const has = own.includes(v.id); const low = s.player.level < v.minLevel; const poor = s.player.cash < v.price;
      return `<div class="card ${low ? 'lock' : ''}"><div class="row"><div class="pi">${v.icon}</div><div class="col" style="flex:1"><b>${v.name}</b><span class="mut">+${v.visit} site visit score</span><span class="mut">${v.note}</span></div>${has ? chip('Owned', 'green') : ''}</div>
      ${has ? '' : btn({ label: low ? `Unlocks at level ${v.minLevel}` : `Buy · ${inr(v.price)}`, act: 'buy', arg: v.id, disabled: low || poor, reason: low ? '' : `Need ${inr(v.price)}. You have ${inr(s.player.cash)}.` })}</div>`;
    }).join('')}`;
  },
  handlers: { buy: ({ arg, toast }) => { const r = dispatch(buyCar, arg); toast(r.ok ? `Bought ${r.v.name}.` : r.msg, !r.ok); } },
};
