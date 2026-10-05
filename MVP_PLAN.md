# MVP PLAN (as built, v1.1)

Status: MVP complete and live. Phase 2 stays locked until approved.

## Delivered
1. PWA shell: plain ES modules, no build step, GitHub Pages ready, offline service worker (cache `svpe-v1.1.0`), install from Chrome.
2. Login by name or guest, 4-step tutorial, first-deal guide on Home.
3. Property marketplace: take a listing (free, you earn commission) or buy as an investment (needs cash).
4. Leads: new, active, closed. Contact (1 energy), site visit (2 energy), negotiation up to 5 rounds with buyer patience.
5. Deal: commission 2% (+0.2% per Customer Service level), cash, XP, level-ups, titles.
6. Weekly tick every 25 s or by the Advance button: energy +2, rent, new leads, market drift, lead expiry (5 weeks).
7. Business upgrades (6 tracks, 5 levels), daily missions, tokens and lead boost.
8. Save and load: localStorage with checksum and backup, offline catch-up.
9. Android back button steps back through screens.

## Economy
- Start cash Rs 5,00,000. Cheapest investment property is about Rs 18 L, so the first goal is commission.
- XP: contact +5, visit +15, deal +50 and +1 per Rs 10,000 commission. Level n needs 100 x n^1.5 XP.

## Not in the MVP (Phase 2, locked)
Staff, vehicles, interactive map, cloud accounts, Firebase, advanced systems.

## Tests
`node --test tests/*.test.js` (logic, deal loop, 1000-week simulation, exploit guards, screen render).
