# Property Empire changes and standing rules

## 2026-10-14 - Shared-origin cache isolation
Property Empire activation formerly deleted every origin cache other than its own. Restrict cleanup to svpe- caches, fetch reads/writes to app path and own cache. v1.3.3-cache-isolation.
No manifest/id/start_url/scope/icon or gameplay/data changes. This fixes sibling offline-cache risk, not proof of Android icon-loss cause, which remains unknown.
Preserve existing features, branding, progress, notes and data. Free services only. Verify live before completion; label emulation and unknowns honestly.
