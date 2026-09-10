---
"@playcanvas/react": patch
---

Respect explicit static scriptName values when cleaning up Script components so unmounting removes the registered script and remounting avoids duplicate-script warnings. Preserve class-name fallback cleanup for scripts without an explicit name.
