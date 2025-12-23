interface ControlsPanelProps {
  title?: string
  children: React.ReactNode
}

export function ControlsPanel({ title = 'Settings', children }: ControlsPanelProps) {
  return (
    <div className="absolute top-5 right-5 z-[100] min-w-[260px] p-6 bg-black/85 backdrop-blur-xl border border-white/[0.08] rounded-xl text-sm text-gray-200">
      <h3 className="mb-4 text-[15px] font-semibold text-brand tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  )
}

interface ControlGroupProps {
  children: React.ReactNode
  className?: string
}

export function ControlGroup({ children, className = '' }: ControlGroupProps) {
  return (
    <div className={`mb-4 last:mb-0 ${className}`}>
      {children}
    </div>
  )
}

