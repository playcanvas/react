## @playcanvas/react
[![Version](https://img.shields.io/npm/v/@playcanvas/react?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@playcanvas/react)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.com/channels/408617316415307776/408617316415307778)
[![Twitter](https://img.shields.io/twitter/follow/playcanvas?label=%40playcanvas&style=flat&colorA=000000&colorB=000000&logo=twitter&logoColor=000000)](https://twitter.com/playcanvas)
![Issues](https://img.shields.io/github/issues/playcanvas/react?style=flat&colorA=000000&colorB=000000)

A lightweight, declarative library for for creating 3D apps that supports Physics, Pointer Events, Gaussian Splats and a built-in Scripting API straight out of the box.

View the docs at [playcanvas-react.vercel.app](https://playcanvas-react.vercel.app)

<img width="1339" alt="image" src="https://github.com/user-attachments/assets/c07f915a-fae2-4aa8-a727-46ec7f300aa8"></img>

### Getting Started

Install the package via npm:

```bash
npm install @playcanvas/react react react-dom playcanvas --save
```
Then, in your React app...

```jsx
import { Application, Entity } from '@playcanvas/react'
import { Camera } from "@playcanvas/react/components"
import { OrbitControls } from "@playcanvas/react/scripts"

const App = (lambo) => {
  return (
    <Application>
        <Entity position={[0, 2, 0]}>
          <Camera/>
          <OrbitControls />
        </Entity>
        <Entity >
          <Container asset={lambo} />
        </Entity>
    </Application>
  );
}
```

#### Features

- Simple declarative API for creating 3D apps
- Supports Asset loading with Suspense boundaries.
- PointerEvents with event bubbling
- Supports [Physics]((https://github.com/kripken/ammo.js)) out of the box
- Imperative Scripting API for the `<Script/>` component for high performance updates.
- Extensible Entity Component System that allows you to add new features.

#### Learning more

With @playcanvas/react you can add interactive 3D content directly within a React project using the same familiar JSX syntax as the rest of your app. The entire React ecosystem such as it's powerful state management and dev tools are available, so you can make live changes and preserve all of your 3D state.

`@playcanvas/react` is built around the popular PlayCanvas engine. If you're not familiar with it or React, it's worth checking out the docs for both. Much of the `@playcanvas/react` api is a thin wrapper around the Entity Component System (ECS) used in PlayCanvas, so even a basic understanding of this is helpful.

You can learn more about PlayCanvas on the [developer site](https://developer.playcanvas.com/) and through the [tutorials](https://developer.playcanvas.com/tutorials/). Similarly the React docs has a [great tutorial section](https://react.dev/learn)

### Contributing

We welcome contributions! Please read our [Contributing Guide](https://github.com/playcanvas/engine/blob/main/.github/CONTRIBUTING.md) to get started.

### Support

If you encounter any issues or have questions, please open an issue on our [GitHub repository](https://github.com/playcanvas/playcanvas-react/issues).
