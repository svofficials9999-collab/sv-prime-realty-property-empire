# Property Empire changes and standing rules

## 2026-10-14 - Shared-origin cache isolation
Property Empire activation formerly deleted every origin cache other than its own. Restrict cleanup to svpe- caches, fetch reads/writes to app path and own cache. v1.3.3-cache-isolation.
No manifest/id/start_url/scope/icon or gameplay/data changes. This fixes sibling offline-cache risk, not proof of Android icon-loss cause, which remains unknown.
Preserve existing features, branding, progress, notes and data. Free services only. Verify live before completion; label emulation and unknowns honestly.

## 2026-10-14 - Distinct manifest IDs across four apps
Chrome's parsed live manifests showed id './' resolving to the shared origin https://svofficials9999-collab.github.io/ for AksharaNova, Pop Raja, SV PRIME REALTY and Property Empire. Correct only their id to each app's root-relative path. Names, start URLs, scopes, icons and all user data remain unchanged. MECHONIC and the poster/video route remain untouched.
The shared identity defect is verified. Whether it actually replaced Android installed apps on the owner's phone remains unverified. Existing shared-ID installs do not have guaranteed automatic migration; use the corrected app links for distinct installs. Do not uninstall apps or clear browser/site data to troubleshoot.
Evidence: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id and https://developer.chrome.com/docs/capabilities/pwa-manifest-id. Mobile 375px live screens visually inspected; service-worker cache cleanup mock preserves sibling caches. No physical phone certification.
