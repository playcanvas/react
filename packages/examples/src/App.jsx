import './App.css'
import { Application } from '@playcanvas/react'
import { GlbViewer } from './GlbViewer'
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SHADERPASS_FORWARD, SHADERPASS_WORLDNORMAL } from 'playcanvas';
import { Script } from '@playcanvas/react/components';
import { Grid } from '@playcanvas/react/scripts';
import { Entity } from '@playcanvas/react';

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

  const [shading, setShading] = useState(SHADERPASS_FORWARD);

  return (
      <ErrorBoundary fallbackRender={fallbackRender} >
        <QueryClientProvider client={queryClient}>
          <button onClick={_ => setShading(shading === SHADERPASS_FORWARD ? SHADERPASS_WORLDNORMAL : SHADERPASS_FORWARD)}>Change Shading</button>
          <Application >
              <Suspense >
                <GlbViewer shading={shading} />
              </Suspense>
          </Application>
        </QueryClientProvider>
      </ErrorBoundary>
  )
}

export default App
