# SV PRIME REALTY: PROPERTY EMPIRE
**BUY • SELL • RENT • BUILD**

Mobile-first (Android, portrait 9:16) real estate business simulation set in Hyderabad. The player starts as a Small Broker and grows into a Real Estate Tycoon.

Core loop: PROPERTY → LEAD → CUSTOMER → SITE VISIT → NEGOTIATION → DEAL → COMMISSION → UPGRADE → EXPANSION

## Status
Phase 1: architecture and plan (this commit). No game code yet. Advanced systems (Phase 2) wait until the MVP is stable.

## Docs
- [GAME_DESIGN.md](GAME_DESIGN.md) - rules, economy, progression
- [ARCHITECTURE.md](ARCHITECTURE.md) - stack, modules, folder structure
- [DATABASE.md](DATABASE.md) - data models and Firestore schema
- [MVP_PLAN.md](MVP_PLAN.md) - 12 build steps with acceptance checks
- [UI_STRUCTURE.md](UI_STRUCTURE.md) - screens, navigation, components

## Stack (one line)
Installable web app (PWA) in plain ES modules, served from GitHub Pages: no build step, runs full screen on Android, same deploy routine as the existing apps. Firebase is optional and plugs in behind a service interface.

## Rules
No fake features, no inactive primary buttons, no legal claims (RERA/DTCP etc.) unless true. Existing repos are never modified by this project.
