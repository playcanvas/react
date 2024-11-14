import './App.css'
import { Application } from '@pc-react'
import { GlbViewer } from './GlbViewer'
import { Suspense } from 'react';
import { Leva } from 'leva';

function App() {

  return <>
    <div onMouseMove={e => e.stopPropagation() } >
      <Leva />
    </div>
    <Application >
        <Suspense >
          <GlbViewer src='/lamborghini_vision_gt.glb' envMapSrc='/environment-map.png'/>
        </Suspense>
    </Application>
  </>
}

export default App
