import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../src/state/newGame.js';
import * as A from '../src/state/actions.js';
import * as onb from '../src/ui/screens/onboarding.js';
import { home } from '../src/ui/screens/home.js';
import { properties, property } from '../src/ui/screens/properties.js';
import { mine } from '../src/ui/screens/mine.js';
import { leads, customer } from '../src/ui/screens/leads.js';
import { visit } from '../src/ui/screens/visit.js';
import { negotiate } from '../src/ui/screens/negotiation.js';
import { deal } from '../src/ui/screens/deal.js';
import { business } from '../src/ui/screens/business.js';
import { missions } from '../src/ui/screens/missions.js';
import { profile, settings } from '../src/ui/screens/profile.js';
import { map } from '../src/ui/screens/map.js';

const ok = (html, name) => { assert.equal(typeof html, 'string', name); assert.ok(html.length > 50, name); assert.ok(!/undefined|NaN|\[object/.test(html), name + ' has bad text: ' + (html.match(/.{30}(undefined|NaN|\[object).{30}/) || [''])[0]); };
test('all 16 screens render in every state of the loop', () => {
  const s = newGame('Srinivas', 4242, '2026-10-05');
  const l = s.leads[0]; const pid = s.properties[0].id;
  ok(onb.splash.render(), 'splash'); ok(onb.login.render(), 'login');
  for (let i = 0; i < 4; i++) ok(onb.tutorial.render(s, { step: i }), 'tutorial' + i);
  const all = () => {
    ok(home.render(s), 'home'); ok(properties.render(s, {}), 'properties'); ok(property.render(s, { id: pid }), 'property');
    ok(property.render(s, { id: s.properties.find((p) => p.status === 'market').id }), 'property-market');
    ok(mine.render(s), 'mine'); ok(leads.render(s), 'leads'); ok(customer.render(s, { leadId: l.id }), 'customer');
    ok(business.render(s), 'business'); ok(missions.render(s), 'missions'); ok(profile.render(s), 'profile'); ok(settings.render(s), 'settings'); ok(map.render(s), 'map');
  };
  all();
  A.contactLead(s, l.id); all();
  A.doVisit(s, l.id); ok(visit.render(s, { leadId: l.id }), 'visit'); all();
  A.beginNegotiation(s, l.id); ok(negotiate.render(s, { leadId: l.id }), 'negotiate');
  let g = 0; while (l.neg.status === 'open' && g++ < 6) { A.negCounter(s, l.id, l.neg.ask); if (l.neg.status === 'open' && l.neg.offer >= l.neg.floor) A.negAccept(s, l.id); }
  ok(deal.render(s, { leadId: l.id }), 'deal'); all();
  s.properties.find((p) => p.status === 'market'); // lost path
  for (let i = 0; i < 30; i++) A.tick(s, '2026-10-05');
  const l2 = s.leads.find((x) => x.status === 'new');
  if (l2) { s.player.energy = 10; A.contactLead(s, l2.id); A.doVisit(s, l2.id); A.beginNegotiation(s, l2.id); A.negWalk(s, l2.id); ok(deal.render(s, { leadId: l2.id }), 'deal-lost'); }
  all();
});
