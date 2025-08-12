# @playcanvas/react

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
