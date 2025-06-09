# Building Blocks for 3D

A set of beautifully crafted high-level 3D primitives for React, built on @playcanvas/react — designed to help you compose 3D content with minimal setup.

## Getting Started

```bash
npm install @playcanvas/blocks playcanvas
```

Follow this guide to [Install Tailwind v4](https://tailwindcss.com/docs/installation)

And add the following top your css

```css
@import "@playcanvas/blocks"
@source "../../node_modules/@playcanvas/blocks";
```

...and you're done!

## Blocks

### Splat Viewer

A responsive and composable component for displaying **Gaussian splats**.

<img width="892" alt="image" src="https://github.com/user-attachments/assets/a43d2955-85ff-4339-8847-109ea9577111" />

Includes built-in camera controls, loading states, and optional UI slots for overlays or actions.  
Supports large assets with lazy loading and automatic framing. Use it in modals, pages, or full-screen scenes. 

Supports compressed gaussian splats.

```jsx
import { Viewer } from "@playcanvas/blocks"

export function SplatViewer() {
    return (
      <Viewer.Splat src='./splat.ply' className="rounded shadow cursor-grab active:cursor-grabbing" >
        <Viewer.Controls >
          <div className="flex gap-1 pointer-events-auto flex-grow">
            <Viewer.FullScreenButton />
            <Viewer.DownloadButton />
          </div>
          <div className="flex gap-1 pointer-events-auto">
            <Viewer.CameraModeToggle />
            <Viewer.HelpButton />
            <Viewer.MenuButton />
          </div>
        </Viewer.Controls>
      </Viewer.Splat>
    )
}
```
