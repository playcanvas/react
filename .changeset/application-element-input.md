---
"@playcanvas/react": patch
---

`<Application>` now creates an `ElementInput`, so elements with `useInput`, buttons, scroll views and scrollbars respond to the mouse, touch and XR input sources. It is created before the mouse and touch devices, so calling `stopPropagation()` in a UI event handler also keeps the event from `app.mouse` and `app.touch`.
