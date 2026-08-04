---
"@playcanvas/react": patch
---

Fix import crash in DOM-less environments (SSR/SSG) with engine 2.20.0–2.20.4: the module-scope null application's mock canvas now stubs `getBoundingClientRect`, which the `GraphicsDevice` constructor probes in those engine versions.
