---
"@playcanvas/react": patch
---

Fix `<Element>` layout and colors, and `<Screen scaleMode="none">`. `<Element>` now applies only the props you give it, the type first and the anchor, pivot and margins before the width and height, so the defaults of the props you leave out no longer overwrite an image's height or an element's margins on every render. `color`, `outlineColor` and `shadowColor` accept CSS color strings, arrays and `Color` objects, where strings and arrays used to leave the element's color as NaN. `<Screen>` accepts the engine's `scaleMode="none"`; `"stretch"` and `"fit"`, which the engine never supported, are removed.
