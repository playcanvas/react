---
"@playcanvas/react": patch
---

Fix Script cleanup for scripts whose class name differs from their registered name (such as an explicit static `scriptName` after bundling or minification), so unmounting removes the script and remounting no longer warns about a duplicate.
