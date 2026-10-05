# ARCHITECTURE

## Stack decision
Plain JavaScript ES modules + HTML/CSS (DOM UI, CSS transforms for animation), packaged as a PWA (manifest + service worker), hosted on GitHub Pages.
Why: the game is a menu/dashboard sim, not a physics game. DOM + GPU-composited CSS holds 60 FPS on mid-range Android, installs to the home screen, works offline, and deploys with the same GitHub Pages routine as the existing apps. No build tool means no toolchain to break. Canvas is used only for the Hyderabad map (Phase 2 can swap to a game engine if needed).

## Layers (strict dependency direction: UI -> state -> logic -> data)
```
ui/          screens, components, router (renders state, sends actions)
state/       store, actions, selectors (single source of truth)
logic/       pure functions: economy, leads, customers, visits, negotiation, deals, xp, missions, events
data/        static content (properties seeds, locations, archetypes, upgrades) as JSON
services/    storage (local), auth, cloud (Firebase adapter), analytics, clock, rng
```
Rules:
- logic/ has no DOM, no storage, no Date.now: time and randomness are injected (clock, seeded rng). This makes every rule unit-testable and replayable for server validation.
- UI never mutates state; it dispatches actions.
- services are interfaces with a local implementation first; Firebase implementation is a drop-in.

## Folder structure
```
sv-prime-realty-property-empire/
  README.md  GAME_DESIGN.md  ARCHITECTURE.md  DATABASE.md  MVP_PLAN.md  UI_STRUCTURE.md   (docs/ mirror)
  index.html
  manifest.webmanifest
  sw.js
  assets/ icons/ fonts/ images/
  src/
    main.js                 boot, wiring
    config/ constants.js  balance.js  locations.js
    data/ properties.seed.json  customers.archetypes.json  upgrades.json  missions.json  events.json
    models/ property.js  lead.js  customer.js  deal.js  player.js  upgrade.js  mission.js  event.js   (factories + validators)
    logic/
      economy.js  xp.js  properties.js  leads.js  customers.js
      siteVisit.js  negotiation.js  deals.js  upgrades.js  missions.js  marketEvents.js
    state/ store.js  actions.js  reducers.js  selectors.js  migrations.js
    services/
      storage/ localStore.js  saveSchema.js
      auth/ authService.js  localAuth.js  firebaseAuth.js
      cloud/ cloudSync.js  firebaseCloud.js
      analytics.js  clock.js  rng.js
    ui/
      router.js  theme.css  layout.css
      components/ Button.js  Card.js  Modal.js  Toast.js  Stat.js  ProgressBar.js  BottomNav.js  PropertyCard.js  CustomerCard.js
      screens/ Splash.js  Login.js  Tutorial.js  Home.js  Properties.js  PropertyDetails.js  Leads.js  Customer.js  SiteVisit.js  Negotiation.js  DealResult.js  MyProperties.js  Business.js  Missions.js  Profile.js  Settings.js  Map.js
    util/ money.js (INR lakh/crore formatting)  id.js  assert.js
  tests/ logic/*.test.js  e2e/mvp-deal.test.js  (node --test, no dependencies)
  firebase/ firestore.rules  functions/ (Phase 2 validation)  README.md
```
Each file stays small and single-purpose; no file above ~300 lines.

## State and save
- One immutable-style store, `dispatch(action)` -> reducer -> new state -> subscribed screens re-render only affected components.
- Save: localStorage (IndexedDB if size grows) key `svpe.save.v1`, versioned with `migrations.js`. Autosave on every committed action (debounced 500 ms) and on visibilitychange.
- Save/load verified by checksum; corrupt save falls back to previous backup slot.

## Auth and cloud (optional, behind interfaces)
- MVP: local guest profile ("Login" screen offers Guest now; Google/phone sign-in appears only once Firebase is configured, never as a dead button).
- Phase 2: Firebase Auth + Firestore + Storage + Analytics. Economy validation in Cloud Functions (deal result, commission, rental claim) so client cannot mint cash. Cloud Functions need Firebase Blaze plan: a business decision for later.
- Conflict rule: cloud save with higher `updatedAt` and valid server-signed deal log wins.

## Performance rules
- Animate only transform/opacity; no layout thrash; lists virtualized past 50 items.
- Images lazy, WebP, max 800px; icons SVG sprite.
- Tick loop: one 1 Hz game tick (not per-frame). Frame work stays UI-only.
- Budget: first load < 300 KB code, interaction response < 100 ms.

## Testing
- Unit: every logic/ module with seeded rng (node --test).
- E2E script: simulates a full deal (property -> lead -> customer -> visit -> negotiation -> deal -> commission -> XP) headless; must pass before any release.
- Manual device checklist on a mid-range Android (portrait, offline, reload mid-negotiation).

## Git workflow
One feature per commit/PR: `feat(properties): ...`, `feat(leads): ...`. Never edit other repositories. Deploy via GitHub Pages from main.

## As built (MVP)
Matches the layout above with these simplifications: screens are grouped by feature (onboarding, properties, leads, negotiation, business, profile+settings), one `data/` file per content type as JS modules (no fetch, works offline), and the store runs reducers that update the single state object, then notifies the UI and autosaves (300 ms debounce, plus on page hide). Market, rent and leads advance on a 25-second game week timer that pauses while a negotiation is open.
