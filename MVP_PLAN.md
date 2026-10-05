# MVP PLAN

MVP goal: a player completes one full real deal, every button works, state survives reload. No Phase 2 work until this is stable.

| # | Step | Deliverable | Done when |
|---|---|---|---|
| 1 | Architecture | these docs, repo skeleton, PWA shell | opens on Android, installs to home screen |
| 2 | Data models | models/, saveSchema, seeds (9 locations, ~30 properties, 5 archetypes) | validators pass unit tests |
| 3 | UI foundation | theme (navy/blue/gold/white/green), router, BottomNav, components, splash, login (guest), tutorial shell | all 5 nav tabs switch, 60 FPS scroll |
| 4 | Property system | Properties list, filters, details, My Properties | list/filter/detail real data |
| 5 | Lead system | lead generation tick, Leads list, Customer profile | leads arrive and can be contacted |
| 6 | Site visit | visit scheduling + fit score + result | visit outcome affects negotiation |
| 7 | Negotiation | rounds engine + UI, 3 outcomes | scripted example (75L / 65L / 72L) reproduces |
| 8 | Deal closing | deal result screen, property status change | deal recorded |
| 9 | Economy and XP | commission, cash, XP, levels, 6 upgrades, daily missions | 50L x 2% = Rs 1,00,000 test passes |
| 10 | Save/load | autosave, backup slot, migrations | reload at any screen resumes |
| 11 | Test full MVP | e2e deal script + device checklist | zero failures |
| 12 | Fix and performance | bug fixes, profiling | no console errors, interactions < 100 ms |

Each step is its own commit/PR. After step 12, stop and review before Phase 2 (map interactivity, staff, vehicles, achievements, leaderboard, Firebase cloud sync).

## Out of MVP (Phase 2)
Interactive map, market events UI polish, staff, vehicles, achievements, leaderboard, cloud sync, analytics, more property types.

## Risks
- Balance: tune in `balance.js` only; simulate 1,000 headless runs before release.
- Firebase billing for server validation: decision needed later.
