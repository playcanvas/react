import './App.css'
import { Application } from '@playcanvas/react'
import { GlbViewer } from './GlbViewer'
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SHADERPASS_FORWARD, SHADERPASS_WORLDNORMAL } from 'playcanvas';
import { Leva } from 'leva';

// Create a client
const queryClient = new QueryClient()

function fallbackRender({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error?.message}</pre>
    </div>
  );
}

function App() {

  return (
      <ErrorBoundary fallbackRender={fallbackRender} >
        <QueryClientProvider client={queryClient}>
          <div onMouseMove={e => e.stopPropagation() } >
            <Leva />
          </div>
          <Application >
              <Suspense >
                <GlbViewer src='/lamborghini_vision_gt.glb' envMapSrc='/environment-map.png'/>
              </Suspense>
          </Application>
        </QueryClientProvider>
      </ErrorBoundary>
  )
}

export default App
