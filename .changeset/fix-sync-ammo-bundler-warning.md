---
"@playcanvas/react": patch
---

Ship `sync-ammo` as a regular dependency so bundlers no longer emit "Module not found: Can't resolve 'sync-ammo'" warnings when physics is disabled. Physics now works out of the box without a separate install; Ammo is still code-split into a lazy chunk that browsers only fetch when `usePhysics` is enabled.
