[![npm version](https://img.shields.io/npm/v/@playcanvas/react.svg)](https://www.npmjs.com/package/@playcanvas/react)

A React renderer for [PlayCanvas](https://github.com/playcanvas/engine) – build interactive 3D applications using React's declarative paradigm.

## Introduction

**@playcanvas/react** is a thin React wrapper around the PlayCanvas 3D engine. It allows developers to create interactive 3D applications and games using React components and hooks, bringing the declarative and component-based architecture of React to PlayCanvas.

By leveraging React's features, you can build complex 3D scenes with reusable components, manage state efficiently, and create interactive experiences with ease.

![Model Viewer](https://github.com/user-attachments/assets/1e85caa8-b61a-4c97-99e5-cb117fc6b338)

[View Example](https://codesandbox.io/p/sandbox/upbeat-wave-d4s6ty?file=%2Fsrc%2FApp.jsx)

[See examples on CodeSandbox](https://codesandbox.io/examples/package/@playcanvas/react)

## Features

- **Declarative 3D Scene Composition**: Construct 3D scenes using JSX, making your code more readable and maintainable.
- **Reusable Components**: Create and compose reusable 3D components, enabling modularity and scalability in your projects.
- **React Hooks Integration**: Use React hooks to manage state and lifecycle events within your 3D components.
- **Event Handling**: Utilize React's event system for user interactions within the 3D environment.
- **Interoperability**: Seamlessly integrate with other React libraries and tools.

## Installation

Install the package via npm:

```bash
npm install @playcanvas/react
```

Ensure that you have the peer dependencies installed:

```bash
npm install react react-dom playcanvas
```

## Getting Started

Here's a simple example to get you started with **@playcanvas/react**.

### Basic Setup

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { Application, Entity } from '@playcanvas/react'
import { Camera } from "@playcanvas/react/components"
import { OrbitControls } from "@playcanvas/react/scripts"

function App() {
  return (
    <Application>
        <Entity>
          <Camera/>
          <OrbitControls />
        </Entity>

        <Entity >
          <Render type='box' />
        </Entity>
    </Application>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](https://github.com/playcanvas/engine/blob/main/.github/CONTRIBUTING.md) to get started.

## Roadmap

- [ ] Support for advanced PlayCanvas features like physics and particles.
- [ ] Integration with popular React libraries for state management and routing.
- [ ] More examples and tutorials.
- [ ] Improved TypeScript definitions.

## Support

If you encounter any issues or have questions, please open an issue on our [GitHub repository](https://github.com/playcanvas/playcanvas-react/issues).

## Acknowledgments

- [PlayCanvas](https://playcanvas.com/) for their powerful 3D engine.
- The React community for the inspiration and support.

---

Happy coding!
