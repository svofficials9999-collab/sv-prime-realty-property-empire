# DATABASE (as built, MVP v1.1)

The MVP has no server database. One JSON document is saved in the phone's localStorage. Money is integer rupees. Ids are short strings.

## Storage
- Key `svpe.save.v1` holds `{ v, sum, body }`. `body` is the state as a JSON string and `sum` is a checksum. A save with a wrong checksum is ignored.
- Key `svpe.save.v1.bak` holds the previous good save. Load falls back to it if the main save is damaged.
- Saves are written 300 ms after every action, when the app is hidden and on page close.
- On start, up to 8 missed weeks are caught up from the time of the last save (25 s = 1 week).

## State document
```
{
  version, rng, week, savedAt, today,
  player:   { name, level, xp, cash, tokens, energy },
  business: { office, marketing, sales, tech, propmgmt, service },   // levels 0-5
  properties: [Property], leads: [Lead], customers: [Customer], deals: [Deal],
  stats:    { deals, sales, earned, lost },
  market:   { loc: { [locationId]: { idx, demand, trend } }, events: [Event] },
  missions: { date, items: [{ id, progress, claimed }] },   // reset each calendar day
  tutorial: { done },
  nav: { route, params }, ui: {}
}
```

## Models
- **Property**: id, type (plot|bhk2|bhk3|villa|shop), location, area, unit, title, ask, floor, yieldPct, rentWeekly, status (market|listed|owned|sold|gone), forSale, createdWeek, boughtAt, soldPrice.
- **Lead**: id, propertyId, customerId, status (new|contacted|visited|negotiating|won|lost|expired), source, createdWeek, expiresWeek, visit, neg, result.
- **Customer**: id, name, archetype, budget, prefType, prefLocation, urgency, skill, risk, satisfaction, openPct.
- **Visit** (inside lead): outcome (liked|neutral|disliked), score, fit {loc,type,budget}, comment.
- **Negotiation** (inside lead): ask, floor, buyerMax (hidden), offer, round, maxRounds, patience, concede, history, status (open|won|lost), price, note, reason.
- **Deal**: id, leadId, propertyId, customerId, price, rate, commission, proceeds, own, xp, week.

## Rules that protect the data
- A deal is created once per lead. A won lead cannot be accepted, countered or walked away from again.
- When a property sells, every other open lead on it (including negotiating ones) is closed as lost.
- Missions are claimed once per day. Reward cash and XP are added only when `claimed` flips from false to true.
- Resale of a property the player bought earns XP on profit only.

## Phase 2 (locked, not built)
Cloud save, accounts, staff, vehicles, interactive map, advanced systems.
