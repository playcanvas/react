# @playcanvas/react

## 0.10.2

### Patch Changes

- deab2a7: Fix ensures font works with use asset hook
- f147fa5: Fixes a race condition with the Entity component when setting transform props

## 0.10.1

### Patch Changes

- 39c8647: Ensure any member defined with a setter is called appropriately
- 98dc81c: Prevents deprecation warnings flooding the console during prop validation

## 0.10.0

### Minor Changes

- fa859ed: Full removes the Grid Script. Please use the official version in the playcanvas engine
- 617939a: Fully removes the deprecated <EnvAtlas/> component
- 3edf166: Removes deprecated ShadowCatcher. Use the Playcanvas exported version
- fa859ed: Removes deprecated Grid Script. Use Playcanvas script instead
- 3082203: Adds a new `<Environment showSkybox={false}/>` prop which can hide the skybox layer.

## 0.9.1

### Patch Changes

- 6372f9c: Ensure better prop validation for components that only have a setter.

## 0.9.0

### Minor Changes

- 118c922: feat(playcanvas): update dependency playcanvas to v2.11.4

## 0.8.0

### Minor Changes

- 6c3f3c9: Exposes a new usePhysics hook to determine physics engine state

### Patch Changes

- 8138b6a: Fix type definition for Collision component to support proper Vec3 serialization
- f74918d: Fixes issue with Environment cleanup
- f5f3001: Allow custom events in useAppEvent
- 91fac3a: Fixes prop assignment for components with setters

## 0.7.0

### Minor Changes

- 1e8d7e6: Ensure onInteractionEvent callback does not run if there are no bound pointerEvents in the react tree
- 62d7178: Added a new Gizmo Component

### Patch Changes

- 28998cb: Update deps
- 0b08685: Ensure Picker is not running unnecessarily

## 0.6.0

### Minor Changes

- 637d196: Introduces a new <Environment/> component for environment lighting and deprecates the EnvAtlas component
- 842abe2: Deprecate useFrame and introduce useAppEvent API

### Patch Changes

- 28a7345: Deprecated Grid and ShadowCatcher scripts. These will be removed in the next major release
- 931eac0: Include TS Source inside source maps
- 9dae0be: Ensures the NODE_ENV is compatible in browser only environments. Defaulting to production
- 85229d7: Fixes an issue setting light colors

## 0.5.0

### Minor Changes

- 894ca08: Added new deviceTypes api for WebGPU and fallback devices

### Patch Changes

- 4917998: We now ensure build outputs retain .js suffix in import paths. This ensures compatibility with the ESM spec
