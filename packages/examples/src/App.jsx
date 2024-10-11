import './App.css'
import { Application } from '@playcanvas/react'
import { Game } from './Game'
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
          <Application >
              <Suspense >
                <Game />
              </Suspense>
          </Application>
        </QueryClientProvider>
      </ErrorBoundary>
  )
}

export default App
