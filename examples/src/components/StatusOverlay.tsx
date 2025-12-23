interface StatusOverlayProps {
  status: 'loading' | 'error'
  message?: string
}

export function StatusOverlay({ status, message }: StatusOverlayProps) {
  const isError = status === 'error'
  
  return (
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg ${isError ? 'text-red-500' : 'text-white'}`}>
      {isError ? `Error: ${message}` : 'Loading...'}
    </div>
  )
}

