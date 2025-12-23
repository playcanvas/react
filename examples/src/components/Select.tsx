interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-text-subtle">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/[0.06] border border-white/15 rounded-md text-[13px] text-gray-200 font-mono cursor-pointer transition-colors duration-200 focus:outline-none focus:border-brand/50 [&>option]:bg-bg-panel [&>option]:text-gray-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

