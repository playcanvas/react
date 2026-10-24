---
"@playcanvas/react": minor
---

Add a `maxPixelRatio` prop to `Application` and `ApplicationWithoutCanvas`, which sets `app.graphicsDevice.maxPixelRatio` so apps can render sharply on high-DPI screens, for example `<Application maxPixelRatio={Math.min(window.devicePixelRatio, 2)} />`. The prop is re-applied when it changes, and when it is omitted the engine's default is kept.
