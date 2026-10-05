import { btn } from '../components.js';
import { GAME_NAME, TAGLINE } from '../../config/constants.js';
import { dispatch, setState, flush } from '../../state/store.js';
import { newGame } from '../../state/newGame.js';
import { finishTutorial } from '../../state/actions.js';
import { today } from '../../services/clock.js';
import { esc } from '../../util/dom.js';

export const splash = {
  render: () => `<div class="splash"><div class="logo">🏙️</div><h1>${GAME_NAME}</h1><div class="tag">${TAGLINE}</div><p class="mut" style="margin-top:28px">Loading…</p></div>`,
};
export const login = {
  render: () => `<div class="splash"><div class="logo">🏙️</div><h1>${GAME_NAME}</h1><div class="tag">${TAGLINE}</div>
  <div style="width:100%;margin-top:28px;text-align:left"><div class="mut" style="margin-bottom:6px">Your name</div>
  <input type="text" id="nm" maxlength="24" placeholder="e.g. Srinivas" autocomplete="off">
  ${btn({ label: 'Play as Guest', act: 'start' })}
  <p class="mut" style="text-align:center">Progress is saved on this phone. Works offline.</p></div></div>`,
  handlers: {
    start: ({ root, go }) => {
      const name = (root.querySelector('#nm').value || '').trim() || 'Agent';
      setState(newGame(name, (Date.now() & 0x7fffffff) || 1, today()));
      flush();
      go('tutorial', { step: 0 });
    },
  },
};
const STEPS = [
  ['📋', 'Properties', 'You start with 3 listings. Customers show up as Leads. Take more listings from the Properties tab.'],
  ['📞', 'Lead → Customer', 'Open a lead, contact the customer, then take them on a site visit. Each step costs ⚡ energy.'],
  ['🤝', 'Negotiate', 'The buyer opens low. Counter until you agree. Stay above the seller price or lose the deal.'],
  ['💰', 'Commission & Growth', 'You earn 2% commission on every deal. Spend it on Business upgrades and level up to Tycoon.'],
];
export const tutorial = {
  render: (s, p) => {
    const i = p.step || 0; const [ic, t, d] = STEPS[i];
    return `<div class="splash"><div class="logo">${ic}</div><h1>${t}</h1><p class="mut" style="max-width:320px;font-size:14px">${d}</p><p class="mut">${i + 1} / ${STEPS.length}</p>
    <div style="width:100%">${btn({ label: i < STEPS.length - 1 ? 'Next' : 'Start playing', act: 'next', arg: i })}</div></div>`;
  },
  handlers: {
    next: ({ arg, go }) => {
      const i = +arg;
      if (i < STEPS.length - 1) go('tutorial', { step: i + 1 });
      else { dispatch(finishTutorial); go('home'); }
    },
  },
};
export { esc };
