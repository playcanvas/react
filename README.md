## @playcanvas/react
⚡ A full-featured library for building interactive 3D apps in React — with assets, physics, and events all built in.

[![Version](https://img.shields.io/npm/v/@playcanvas/react?style=flat&colorA=333333&colorB=444444)](https://www.npmjs.com/package/@playcanvas/react)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&olorA=333333&colorB=444444&label=discord&logo=discord&logoColor=ffffff)](https://discord.com/channels/408617316415307776/408617316415307778)
[![Twitter](https://img.shields.io/twitter/follow/playcanvas?label=%40playcanvas&style=flat&colorA=333333&colorB=333333&logo=x&logoColor=ffffff)](https://x.com/playcanvas)
![Issues](https://img.shields.io/github/issues/playcanvas/react?style=flat&colorA=333333&colorB=444444)

[Docs](https://playcanvas-react.vercel.app) | [Guide](http://playcanvas-react.vercel.app/docs/guide/getting-started) | [Examples](https://playcanvas-react.vercel.app/examples/)

<a href="https://playcanvas-react.vercel.app/examples/splats" target="_blank" >
  <img alt="@playcanvas/react" src="https://github.com/user-attachments/assets/159bdadb-1b7d-4334-8acb-c4530b570f2b" />
</a>

### Getting Started

Install with your favorite package manager...

```bash
npm install @playcanvas/react playcanvas
```

Load an Asset

```jsx
import { Application, Entity } from '@playcanvas/react';
import { Camera, Render } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';
import { useSplat } from '@playcanvas/react/hooks';

const AssetViewer = ({ src }) => {
  const { asset } = useSplat(src);
  if (!asset) return null;

  return (
    <>
      <Entity position={[0, 2, 0]}>
        <Camera />
        <OrbitControls />
      </Entity>
      <Render type="asset" asset={asset} />
    </>
  );
};

const App = () => {
  return (
    <Application>
      <AssetViewer src="skull.ply" />
    </Application>
  );
};
```

Et voilà! ✨

## Why @playcanvas/react?

@playcanvas/react gives you everything you need to build 3D apps in React — without pulling in a maze of external libraries.

It ships with powerful built-in features out of the box:

- 🎭 Simple Scene API
- ⏳ Suspenseful Asset loading
- ️👆 Pointer Events
- 🛠️ Physics out of the box
- ⚡ Script component
- 🏗️ Entity Component System

## Learn more

To find out more, check the [Getting Started](https://playcanvas-react.vercel.app/docs/guide/getting-started) guide for a walk through, or see the [other examples](https://playcanvas-react.vercel.app/examples/) in the Playground.

- [Hello World](http://playcanvas-react.vercel.app/examples/hello-world)
- [Loading a 3d model](http://playcanvas-react.vercel.app/examples/load-a-3D-model)
- [Interaction](http://playcanvas-react.vercel.app/examples/pointer-events)
- [Physics](http://playcanvas-react.vercel.app/examples/physics)
- [Splats](http://playcanvas-react.vercel.app/examples/splats)

## Contributing

Contributions are welcome! Please open an issue or pull request if you’d like to contribute or report a bug.





