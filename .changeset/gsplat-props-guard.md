---
"@playcanvas/react": patch
---

Fixed GSplat component props re-application causing splat to disappear during React re-renders. Added equality guards for `instance` and `material` properties to prevent destructive setter calls when the value hasn't changed.

