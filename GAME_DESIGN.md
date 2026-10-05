# GAME DESIGN

## Fantasy
A Hyderabad real estate consultant builds a brokerage: list property, chase leads, take customers on site visits, negotiate, close, earn commission, reinvest.

## Core loop
PROPERTY → LEAD → CUSTOMER → SITE VISIT → NEGOTIATION → DEAL → COMMISSION → UPGRADE → EXPANSION

1. Properties appear in the Marketplace (listings to represent) or are bought as investments.
2. Each property attracts Leads over time (rate depends on marketing, area demand, price vs market).
3. A Lead becomes a Customer profile when contacted (costs 1 energy). Energy refills +2 per week, max 10. Leads go cold after 5 weeks without progress.
4. Site Visit: match customer to property. Visit result = fit score (budget, location, type) plus a small random roll. Vehicles are Phase 2.
5. Negotiation: turn-based offer / counter rounds. Outcome: Deal Won, Counter Offer, Deal Lost.
6. Deal closing: commission paid, XP granted, customer satisfaction updated.
7. Cash buys upgrades, staff, vehicles, and investment properties.

## Customers
Fields: name, budget, preferred location, property type, urgency (1-5), negotiationSkill (1-5), riskLevel (1-5), satisfaction (0-100).
Behaviour (data-driven archetypes):
- Bargain Hunter: low urgency, high skill, opens at 80-85% of ask.
- Urgent Buyer: high urgency, accepts near ask, short patience.
- Investor: cares about rental yield and trend, medium skill.
- First-time Buyer: low skill, high risk aversion, needs more visits.
- Cash-rich Upgrader: pays premium for luxury, patience high.

## Negotiation
State: ask (listing), floor (seller expects), buyerMax (hidden, from budget and visit result), offer (buyer's current offer).
Example: ask 75,00,000; buyer opens 65,00,000; seller expects 72,00,000.
Buyer max = min(budget, ask x visit factor). Visit factor: liked 0.99, neutral 0.96, disliked 0.90.
Each round the player can: send a counter (never below the seller floor), accept the buyer's offer (only if it is at or above the floor), or walk away.
- If the counter is at or below buyerMax, the buyer accepts: Deal Won at the counter price.
- Otherwise the buyer moves part of the way toward the counter (concession 30-75%, higher with Sales Team and low-skill buyers) and patience drops by 1 (by 2 if the counter is 12%+ above buyerMax). Result: Counter Offer.
- Patience 0 or round limit (5) reached: Deal Lost.
Patience starts at 6 - 0.8 x urgency (2 to 5). Staff and perks are Phase 2.

## Economy
- Commission = agreedPrice x commissionRate (default 2%). Example: 50,00,000 x 2% = 1,00,000.
- commissionRate grows with upgrades (Office, Customer Service) up to 3%.
- Rental income (investment properties): weekly = price x yield/52, credited per game week (one game week passes about every 25 seconds while the app is open; up to 8 weeks catch up after the app was closed).
- Market price index per location scales by event multipliers and a slow random trend (bounded +-25%).
- All money is integer rupees. Display in Indian format (lakh/crore).
- Costs scale: upgrade level n costs base x 1.6^n. Rewards scale with level so progression stays linear in time.

## Market events
Examples: "Gachibowli demand +15%", "Metro extension: Miyapur prices +8%", "Rate hike: all demand -5%".
Fields: location(s), demandDelta, priceDelta, durationDays. 1 event active per region at a time.
Rule: no event names a real law or approval claim.

## Locations (World)
Gachibowli, Kondapur, Hitech City, Financial District, Narsingi, Tellapur, Kukatpally, Miyapur, Sangareddy.
Each has avgPricePerSqYd, demand (0-100), rentalYield %, trend (up/flat/down), available properties.

## Property types
Open plot, 1BHK, 2BHK, 3BHK, luxury apartment, villa, farm land, commercial shop, office, hostel, warehouse, apartment building.
MVP ships plot, 2BHK, 3BHK, villa, shop. Rest in Phase 2 (data already supports them).

## Progression
| Level | Title |
|---|---|
| 1 | Small Broker |
| 5 | Property Agent |
| 10 | Senior Agent |
| 20 | Property Developer |
| 50 | Real Estate Tycoon |
XP to next level = 100 x level^1.5 (rounded). XP sources: lead contacted 5, visit 15, deal 50 + commission/10,000, mission rewards.
Unlocks: locations by level (Kukatpally, Miyapur at L1; Kondapur, Narsingi at L3; Gachibowli, Hitech City at L5; Tellapur, Sangareddy L8; Financial District L12), property types, staff slots.

## Upgrades (6 tracks, 5 levels each in MVP)
Office, Marketing, Sales Team, Technology, Property Management, Customer Service.
Effects: Office = listing slots; Marketing = lead rate; Sales Team = negotiation bonus; Technology = lead quality; Property Management = rent income; Customer Service = satisfaction.

## Staff (Phase 2)
Sales agent, digital marketer, site visit exec, property manager, legal advisor, accountant. Salary per day, passive effects.

## Vehicles (Phase 2)
Basic car, SUV, luxury car, premium SUV, helicopter. Raise visit quality and unlock far locations.

## Missions (daily)
Complete 5 leads, 2 site visits, close 1 deal, Rs 10 lakh sales, add 3 properties. Reward cash, XP, property tokens (premium listing unlock).

## Anti-cheat stance
Client is authoritative in MVP (offline play). Cloud sync (Phase 2) validates deals server-side: price within market band, commission formula, cooldowns, level gates.
