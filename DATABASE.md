# DATABASE

MVP stores one JSON save document locally (same shape as the cloud document). Money = integer rupees. Ids = short strings.

## Save document (`svpe.save.v1`)
```
{
  version, updatedAt, playerId,
  player: { name, level, xp, cash, tokens, reputation, energy, energyAt, createdAt, title },
  business: { officeLvl, marketingLvl, salesLvl, techLvl, propMgmtLvl, custServiceLvl, staff: [], vehicles: [] },
  properties: { [id]: Property },
  leads: { [id]: Lead },
  customers: { [id]: Customer },
  deals: { [id]: Deal },
  missions: { day, items: [{id, progress, target, claimed}] },
  achievements: { [id]: unlockedAt },
  market: { day, locations: { [loc]: {priceIdx, demand, trend} }, events: [Event] },
  settings: { sound, language, notifications },
  tutorial: { step, done }
}
```

## Models
**Property**: id, title, type, location, areaSqYd|sqft, bedrooms, askPrice, sellerFloor, status (available|listed|reserved|sold|owned|rented), ownerType (client|player), rentMonthly, yieldPct, createdDay, imageKey.
**Lead**: id, propertyId, customerId, source (walk-in|ads|referral|portal), quality (1-5), status (new|contacted|visit_scheduled|negotiating|won|lost), createdDay, expiresDay.
**Customer**: id, name, budget, prefLocation, prefType, urgency, negotiationSkill, riskLevel, satisfaction, archetype, patience.
**SiteVisit**: id, leadId, propertyId, scheduledDay, fitScore, outcome (liked|neutral|disliked), notes.
**Negotiation**: id, leadId, rounds [{by, price, at}], buyerMax (hidden), status.
**Deal**: id, propertyId, customerId, agreedPrice, commissionRate, commission, closedDay, result.
**Upgrade**: track, level, cost, effect.
**Mission**: id, text, kind, target, reward {cash, xp, tokens}.
**MarketEvent**: id, text, locations[], demandDelta, priceDelta, startDay, endDay.

## Firestore (Phase 2)
```
users/{uid}                    profile, level, xp, cash, tokens, updatedAt
users/{uid}/saves/current      full save document
users/{uid}/deals/{dealId}     validated deal log (server-written only)
users/{uid}/missions/{day}     daily mission state
market/{day}                   shared market state (server-written)
leaderboard/{season}/entries/{uid}   name, level, netWorth (server-written)
config/balance                 economy constants (server-written)
```
Security rules: users read/write only own `users/{uid}/saves`; `deals`, `leaderboard`, `market`, `config` are read-only for clients. Cloud Functions validate: price within market band, commission = price x rate, cooldowns, level gates, rental claim limits.
Storage: `users/{uid}/avatar.webp` (own only).
Analytics events: tutorial_complete, lead_contacted, visit_done, deal_won, deal_lost, upgrade_bought, level_up.
