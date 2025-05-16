## @playcanvas/react
[![Version](https://img.shields.io/npm/v/@playcanvas/react?style=flat&colorA=333333&colorB=444444)](https://www.npmjs.com/package/@playcanvas/react)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&olorA=333333&colorB=444444&label=discord&logo=discord&logoColor=ffffff)](https://discord.com/channels/408617316415307776/408617316415307778)
[![Twitter](https://img.shields.io/twitter/follow/playcanvas?label=%40playcanvas&style=flat&colorA=333333&colorB=333333&logo=x&logoColor=ffffff)](https://x.com/playcanvas)
![Issues](https://img.shields.io/github/issues/playcanvas/react?style=flat&colorA=333333&colorB=444444)

[Docs](https://playcanvas-react.vercel.app) | [Guide](http://playcanvas-react.vercel.app/docs/guide/getting-started) | [Examples](https://playcanvas-react.vercel.app/examples/)

A lightweight, library for for creating 3D apps in React that supports Physics, Pointer Events, Gaussian Splats and a built-in Scripts out of the box.

<img width="1673" alt="image" src="https://github.com/user-attachments/assets/92053462-f39e-4f6d-94fc-b34e7b9ea266" />

### Getting Started

⚡ Start building in minutes with our [Stackblitz template](https://playcanvas-react.vercel.app/new).

Or for a local npm setup run the following and follow the [Getting Started Guide](https://playcanvas-react.vercel.app/docs/guide/getting-started).

```bash
npm install @playcanvas/react playcanvas
```

You can also clone the following starter template.

```bash copy
git clone https://github.com/marklundin/playcanvas-react-template.git
```

Create a sphere component

```jsx
import { Application, Entity } from '@playcanvas/react'
import { Camera } from "@playcanvas/react/components"
import { OrbitControls } from "@playcanvas/react/scripts"

const App = () => {
  return (
    <Application>
        <Entity position={[0, 2, 0]}>
          <Camera/>
          <OrbitControls />
        </Entity>
        <Entity >
          <Render type="sphere" />
        </Entity>
    </Application>
  );
}
```

Et voilà! ✨

### Assisted AI Development

To get your IDE up to speed, run the following command from the root of your project to install the latest MDC rules. Or [grab them here](https://playcanvas-react.vercel.app/rules) to add them manually.

```bash
mkdir -p .cursor/rules && curl -s https://playcanvas-react.vercel.app/rules -o .cursor/rules/playcanvas-react.mdc
```

The library is built around the [PlayCanvas engine](https://github.com/playcanvas/engine) and comes with lots of features for creating more complex content including...

- 🎭 Simple Scene API
- ⏳ Suspenseful Asset loading
- ️👆 Pointer Events
- 🛠️ Physics out of the box
- ⚡ Script component for high frequency updates
- 🏗️ Entity Component System

### Learn more

To find out more, check the [Getting Started](https://playcanvas-react.vercel.app/docs/guide/getting-started) guide for a walk through, or see the [other examples](https://playcanvas-react.vercel.app/examples/) in the Playground.

- [Hello World](http://playcanvas-react.vercel.app/examples/hello-world)
- [Loading a 3d model](http://playcanvas-react.vercel.app/examples/load-a-3D-model)
- [Interaction](http://playcanvas-react.vercel.app/examples/pointer-events)
- [Physics](http://playcanvas-react.vercel.app/examples/physics)





