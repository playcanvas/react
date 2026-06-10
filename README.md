[![Version](https://img.shields.io/npm/v/@playcanvas/react?style=flat&colorA=333333&colorB=444444)](https://www.npmjs.com/package/@playcanvas/react)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=333333&colorB=444444&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/RSaMRzg)
[![Twitter](https://img.shields.io/twitter/follow/playcanvas?label=%40playcanvas&style=flat&colorA=333333&colorB=333333&logo=x&logoColor=ffffff)](https://x.com/playcanvas)
[![Issues](https://img.shields.io/github/issues/playcanvas/react?style=flat&colorA=333333&colorB=444444)](https://github.com/playcanvas/react/issues)
[![pkg.pr.new](https://pkg.pr.new/badge/playcanvas/react)](https://pkg.pr.new/~/playcanvas/react)

# @playcanvas/react
_⚡ A full-featured library for interactive 3D in React._

@playcanvas/react is a thin wrapper around [PlayCanvas](https://github.com/playcanvas/engine) — a battle-tested, real-time 3D engine — designed to get you up and running fast.

<img src="https://github.com/user-attachments/assets/4e652314-8540-41ba-ba90-7ffba9f1731d" alt="PlayCanvas React" />

## Why PlayCanvas React?

**@playcanvas/react gets you building fast** — without the usual mess of wiring together separate libraries for physics, input or asset management. It's a complete, batteries-included toolkit for interactive 3D experiences in React.

<p>
  <a href="https://developer.playcanvas.com/user-manual/react/examples/motion/">
    <img src="https://github.com/user-attachments/assets/f7be5ba5-69ae-454e-b730-f37a4b4f37ef" alt="Motion example" width="49%" style="margin: 6px;" />
  </a>
  <a href="https://developer.playcanvas.com/user-manual/react/examples/model-viewer/">
    <img src="https://github.com/user-attachments/assets/fc90d53e-0d7f-485a-9d14-855d1662bc89" alt="Model viewer example" width="49%" style="margin: 6px;" />
  </a>
  <a href="https://developer.playcanvas.com/user-manual/react/examples/physics/">
    <img src="https://github.com/user-attachments/assets/084fc21a-8efa-4967-9e50-e9520a627e8c" alt="Physics example" width="49%" style="margin: 6px;" />
  </a>
  <a href="https://stackblitz.com/edit/pc-react-tick-tock?file=src%2FScene.tsx">
    <img src="https://github.com/user-attachments/assets/66eab2db-197f-4f66-b159-cf62eba8a928" alt="Tick tock clock example" width="49%" style="margin: 6px;" />
  </a>
</p>

### Features

- 🎭 Simple Scene API
- ⏳ Suspenseful asset loading
- 👆 Pointer events
- 🛠️ Physics out of the box
- ⚡ Script component
- 🏗️ Entity Component System

## Getting Started

⚡ Start building in minutes with the [StackBlitz starter](https://stackblitz.com/edit/pc-react-tick-tock?file=src%2FScene.tsx).

Install with your favorite package manager...

```bash
npm install @playcanvas/react playcanvas
```

You can also clone the following starter template.

```bash
git clone https://github.com/marklundin/playcanvas-react-template.git
```

### Show me the code

Here's how you render a sphere.

```jsx
import { Application, Entity } from '@playcanvas/react';
import { Camera, Render } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';

export function AssetViewer() {
  return (
    <Application>
      <Entity position={[0, 2, 0]}>
        <Camera />
        <OrbitControls />
      </Entity>
      <Render type="sphere"/>
    </Application>
  );
}
```

Et voilà! ✨

## Ready to build something?

Now you've got the tools, you're ready to start building. Start with the [Getting Started](https://developer.playcanvas.com/user-manual/react/getting-started/) guide for a step-by-step intro, or dive into the [examples](https://developer.playcanvas.com/user-manual/react/examples/) to see it all in action.

- [Building a scene](https://developer.playcanvas.com/user-manual/react/building-a-scene/)
- [Loading a 3D model](https://developer.playcanvas.com/user-manual/react/guide/loading-assets/)
- [Interaction](https://developer.playcanvas.com/user-manual/react/guide/interactivity/)
- [Model Viewer](https://developer.playcanvas.com/user-manual/react/examples/model-viewer/)
- [Motion](https://developer.playcanvas.com/user-manual/react/examples/motion/)
- [Physics](https://developer.playcanvas.com/user-manual/react/examples/physics/)
- [Splats](https://developer.playcanvas.com/user-manual/react/api/gsplat/)

You can also browse the full [documentation](https://developer.playcanvas.com/user-manual/react/) or the [API reference](https://developer.playcanvas.com/user-manual/react/api/).

## Who's building with @playcanvas/react?

Developers and studios are already using @playcanvas/react in production.

- [Snap AI](https://ai.snapchat.com/) — Real-time 3D interfaces inside Snap's next-gen tools.
- [GSplat Share](https://gsplat.org/) — Share your splats with optional time-limited and password-protected links.
- ✨ Your project here? [Submit a PR](https://github.com/playcanvas/react/compare) and we'll feature it.

## AI-assisted editors

To get your IDE up to speed, install the [PlayCanvas React rules](https://github.com/playcanvas/react/blob/main/packages/lib/.playcanvas-react.mdc) for Cursor:

```bash
mkdir -p .cursor/rules && curl -s https://raw.githubusercontent.com/playcanvas/react/main/packages/lib/.playcanvas-react.mdc -o .cursor/rules/playcanvas-react.mdc
```

## Contributing

The monorepo is split into 2 packages:

- [@playcanvas/react](/packages/lib) - The main React library
- [@playcanvas/blocks](/packages/blocks) - High-level React components for common 3D use cases

To get set up, run `pnpm install` from the root of the monorepo. You can then build each package with `pnpm run build:lib` or `pnpm run build:blocks`, and run the tests with `pnpm test`.

All contributions are welcome :heart:
