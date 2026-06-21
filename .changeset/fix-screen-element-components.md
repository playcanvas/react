---
"@playcanvas/react": patch
---

Fix the `Screen` and `Element` components, which previously failed to render.

- `<Element>` threw `Cannot set property aabb` on mount: the generated prop schema included read-only engine getters (such as `aabb`) and tried to assign to them. It also applied `null` defaults for props the user never set, which broke settable-but-initially-null props like `color` (`this._color.copy(null)`). Read-only accessors are now excluded from the schema, and the schema no longer assigns `null`/`undefined` defaults.
- `<Screen>` rendered nothing because `referenceResolution` was applied as a raw array; the engine setter reads `value.x`/`value.y`, so it now receives a `Vec2`.

Also corrects the `Element` component's JSDoc (previously a copy of `Screen`'s, with an invalid example).
