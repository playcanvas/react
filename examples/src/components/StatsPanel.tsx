import { forwardRef } from 'react'

interface StatRowProps {
  label: string
  value?: string | number
}

export const StatRow = forwardRef<HTMLSpanElement, StatRowProps>(
  function StatRow({ label, value }, ref) {
    return (
      <div className="flex justify-between text-xs mb-2 last:mb-0">
        <span className="text-text-dim">{label}</span>
        <span ref={ref} className="font-semibold text-green-400 font-mono">
          {value}
        </span>
      </div>
    )
  }
)

interface StatsPanelProps {
  title?: string
  children: React.ReactNode
}

export function StatsPanel({ title = 'Stats', children }: StatsPanelProps) {
  return (
    <div className="mt-5 pt-4 border-t border-white/10">
      <h3 className="mb-4 text-[15px] font-semibold text-brand tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  )
}
