import { top, empty, chip } from '../components.js';
import { card } from './properties.js';
import { owned, listed, weeklyRent, netWorth } from '../../state/selectors.js';
import { inrShort } from '../../util/money.js';

export const mine = {
  render: (s) => {
    const o = owned(s); const l = listed(s);
    return `${top('My Properties', 'properties')}
    <div class="grid2"><div class="stat"><b>${inrShort(weeklyRent(s))}</b><span>Rent per week</span></div><div class="stat"><b>${inrShort(netWorth(s))}</b><span>Net worth</span></div></div>
    <h2>Owned (${o.length})</h2>${o.length ? o.map((p) => card(p, `<span>${p.forSale ? chip('For sale', 'gold') : chip('Renting', 'green')}</span>`)).join('') : empty('Buy a property in the Marketplace to earn weekly rent.')}
    <h2>Client listings (${l.length})</h2>${l.length ? l.map((p) => card(p, chip('Listed', 'gold'))).join('') : empty('Take listings from the Marketplace to attract leads.')}`;
  },
  handlers: { open: ({ arg, go }) => go('property', { id: arg }) },
};
