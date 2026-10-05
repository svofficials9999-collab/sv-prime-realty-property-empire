# UI STRUCTURE

Portrait 9:16, safe-area aware, one-hand reach (primary actions bottom half).
Theme: navy #0B1F3A background, royal blue #1F4FD8 surfaces, gold #D4AF37 accents/primary CTA, white text, WhatsApp green #25D366 for contact actions only. Fonts: Poppins/Noto Sans Telugu fallback. Numbers in Indian format.

## Bottom nav (always visible except splash/login/tutorial/negotiation)
HOME | PROPERTIES | LEADS | MAP | BUSINESS

## Screens
1. Splash - logo, tagline, load save, then Login/Home
2. Login - Guest play (MVP); Google/phone appear when cloud is enabled
3. Tutorial - 5 guided steps ending with a real first lead
4. Home - cash, level/XP bar, today's missions, new leads, market event banner, quick actions
5. Properties - marketplace list, filter chips (location, type, price), search
6. Property Details - photos, specs, ask price, area stats, "List it" / "Buy"
7. Leads - tabs New / Active / Closed; urgency badges
8. Customer - profile fields, personality, satisfaction, "Schedule site visit"
9. Site Visit - fit breakdown, vehicle, outcome reveal
10. Negotiation - ask / offer / seller-floor hint, round log, Hold / Counter / Concede / Perk / Walk away
11. Deal Result - Won / Counter / Lost, commission, XP, next action
12. My Properties - owned, listed, rented, income
13. Business - 6 upgrade tracks, staff (locked in MVP, shown as "Coming in Phase 2" only if hidden is impractical), vehicles
14. Missions - daily list, claim button
15. Profile - level, title, stats, achievements (Phase 2)
16. Settings - sound, language, reset save (confirm), about

MAP screen: MVP shows the 9 locations list with avg price, demand, yield, trend and available properties (tap -> filtered Properties). Interactive map graphic in Phase 2.

## Reusable components
Button (primary/secondary/whatsapp, disabled-with-reason), Card, Modal, Toast, Stat, ProgressBar, Badge, BottomNav, PropertyCard, CustomerCard, MoneyText, EmptyState.

## Rules
Every primary button does a real action or is hidden/disabled with the reason shown. Animation only for feedback (deal won, level up). Max 1 primary CTA per screen.
