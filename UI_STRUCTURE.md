# UI STRUCTURE (as built, v1.1)

Mobile-first portrait, navy / royal blue / gold / white. Bottom navigation: HOME, PROPERTIES, LEADS, MAP, BUSINESS. A top bar shows name, level, XP bar, cash, energy and week.

## Screens (src/ui/screens)
- onboarding: splash, login (name or guest), tutorial (4 steps).
- home: Next step button (jumps to the lead that needs action), first-deal guide, Next level XP, stats, missions, My Properties, Advance week, Profile, Settings.
- properties: marketplace with area and type filters, property detail (take listing or buy), mine (owned and listed, sell, withdraw).
- leads: New / Active / Closed tabs, customer detail with Contact, Site visit and Negotiate actions, boost with tokens.
- visit: result, score, why.
- negotiation: asking price, buyer offer, seller minimum, patience, slider and step buttons, counter, accept, walk away, leave and resume.
- deal: win or loss result, commission, XP, next level.
- business: 6 upgrade tracks.
- missions: 5 daily missions with claim.
- profile, settings (reset save).
- map: Phase 2 placeholder (text only).

## Behaviour
- Back button and the on-screen arrow return to the previous screen. Negotiation and deal screens return to Leads, so no action repeats.
- Buttons that cannot be used are disabled with a short reason.
- Toasts confirm actions, rent and new leads.
