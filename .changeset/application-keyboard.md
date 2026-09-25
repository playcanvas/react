---
"@playcanvas/react": patch
---

`<Application>` now creates a `Keyboard` attached to the window, so `app.keyboard` is no longer `null` and scripts and hooks can read key state, for example `app.keyboard.isPressed(KEY_RIGHT)`. It is detached when the application is destroyed on unmount.
