---
"@playcanvas/react": minor
---

Add a `maxPixelRatio` prop to `Application` and `ApplicationWithoutCanvas`, so apps can render sharply on high-DPI screens, for example `<Application maxPixelRatio={2} />`. The canvas renders at the smaller of this value and the display's pixel ratio, which is followed as it changes. When the prop is omitted, the engine's default is kept.
