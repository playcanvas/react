[![Version](https://img.shields.io/npm/v/@playcanvas/react?style=flat&colorA=333333&colorB=444444)](https://www.npmjs.com/package/@playcanvas/react)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=333333&colorB=444444&label=discord&logo=discord&logoColor=ffffff)](https://discord.com/channels/408617316415307776/408617316415307778)
[![Twitter](https://img.shields.io/twitter/follow/playcanvas?label=%40playcanvas&style=flat&colorA=333333&colorB=333333&logo=x&logoColor=ffffff)](https://x.com/playcanvas)
[![Issues](https://img.shields.io/github/issues/playcanvas/react?style=flat&colorA=333333&colorB=444444)](https://github.com/playcanvas/react)
[![pkg.pr.new](https://pkg.pr.new/badge/playcanvas/react)](https://pkg.pr.new/~/playcanvas/react)

## @playcanvas/react
_⚡ A full-featured library for interactive 3D in React._

@playcanvas/react is a thin wrapper around PlayCanvas - a batteries included library for building interactive 3D content in React. Designed to get you up and running fast.

<img src="https://github.com/user-attachments/assets/4e652314-8540-41ba-ba90-7ffba9f1731d" />

## Why PlayCanvas React?

**@playcanvas/react is designed to get you building fast** — without the usual mess of wiring together separate libraries for physics, input or asset management. It's a complete, batteries-included toolkit for interactive 3D experiences in React.

It's built around PlayCanvas - a battle-tested, real-time 3D engine and ships with powerful built-in features out of the box.

<p>  
  <a href="https://playcanvas-react.vercel.app/examples/motion">
    <img src="https://github.com/user-attachments/assets/f7be5ba5-69ae-454e-b730-f37a4b4f37ef" width="49%" style="margin: 6px;" />
  </a>
  <a href="https://playcanvas-react.vercel.app/examples/model-viewer">
    <img src="https://github.com/user-attachments/assets/fc90d53e-0d7f-485a-9d14-855d1662bc89" width="49%" style="margin: 6px;" />
  </a>
  <a href="https://playcanvas-react.vercel.app/examples/physics">
    <img src="https://github.com/user-attachments/assets/084fc21a-8efa-4967-9e50-e9520a627e8c" width="49%" style="margin: 6px;" />
  </a>
  <a href="https://stackblitz.com/edit/pc-react-tick-tock?file=src%2FScene.tsx">
    <img src="https://github.com/user-attachments/assets/66eab2db-197f-4f66-b159-cf62eba8a928" width="49%" style="margin: 6px;" />
  </a>
</p>

### Features

- 🎭 Simple Scene API
- ⏳ Suspenseful Asset loading
- ️👆 Pointer Events
- 🛠️ Physics out of the box
- ⚡ Script component
- 🏗️ Entity Component System

## Getting Started

⚡ Start building in minutes with our [playcanvas-react.app/new](https://playcanvas-react.vercel.app/new) template.

Install with your favorite package manager...

```bash
npm install @playcanvas/react playcanvas
```

You can also clone the following starter template.

```bash copy
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
};
```

Et voilà! ✨

## Ready to build something?

Now you've got the tools you're ready to start building. Start with the [Getting Started](https://developer.playcanvas.com/user-manual/playcanvas-react/getting-started) for a step-by-step intro, or jump straight into the [Playground](https://playcanvas-react.vercel.app/examples) to explore real examples in action.

- [Hello World](https://playcanvas-react.vercel.app/examples/hello-world)
- [Loading a 3d model](https://playcanvas-react.vercel.app/examples/load-a-3D-model)
- [Interaction](https://playcanvas-react.vercel.app/examples/pointer-events)
- [Physics](https://playcanvas-react.vercel.app/examples/physics)
- [Splats](https://playcanvas-react.vercel.app/examples/splats)

You can also jump straight into the [docs](https://developer.playcanvas.com/user-manual/playcanvas-react) or [api](https://developer.playcanvas.com/user-manual/playcanvas-react/api).

## Who’s building with @playcanvas/react?

Developers and studios are already using @playcanvas/react in production

- ⚡ [Snap AI](ai.snap.com) uses @playcanvas/react to build real-time 3D interfaces inside their next-gen tools.
- [GSplat Share](https://gsplat.org/) – Share your splats with optional time-limited and password-protected links.
- ✨ Your project here? [Submit a PR](https://github.com/playcanvas/react/compare) and we’ll feature it below.

## AI assisted editors

To get your IDE up to speed, you can install the latest MDC rules for cursor. Or [grab them here](https://developer.playcanvas.com/user-manual/playcanvas-react/rules) to add them manually.

```bash
mkdir -p .cursor/rules && curl -s https://developer.playcanvas.com/user-manual/playcanvas-react/rules -o .cursor/rules/playcanvas-react.mdc
```

## Contributing

If you want to build the repo from scratch, check out the following. The monorepo is split into 3 main packages:

- [@playcanvas/react](/packages/lib) - This contains the main react library
- [@playcanvas/blocks](/packages/blocks) - High level React components for common 3D use cases
- [@playcanvas/docs](/packages/docs) - The Documentation site.

If you want to run this entire project locally, including docs just `npm install` and `npm run dev` from the root of the monorepo. This will install and build all the local dependencies and run a local webserver of the docs. 

You can make changes to either the react or blocks lib and build them locally by doing `npm run build:lib` or `npm run build:blocks` respectively.

All contributions are welcome :heart:

