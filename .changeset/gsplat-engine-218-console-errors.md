---
"@playcanvas/react": patch
---

Fix console errors when using GSplat with playcanvas 2.18+: exclude the read-only `id` and the removed `lodDistances`/`splatBudget` properties from the GSplat schema, and silence `console.error` during mock-component introspection so engine removal notices don't leak at import time.
