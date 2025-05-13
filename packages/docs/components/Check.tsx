import { Check as CheckIcon, Minus as MinusIcon } from 'lucide-react'

export function Check({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-center justify-center ">
      <div className="bg-teal-800 rounded-full p-1 w-6 h-6 flex items-center justify-center">
        <CheckIcon className='text-teal-400'/>
      </div>
      <span>{ children }</span>
    </div>
  )
}

export function Dash({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-center justify-center ">
      <div className="bg-muted rounded-full p-1 w-6 h-6 flex items-center justify-center">
        <MinusIcon className='text-muted-foreground'/>
      </div>
      <span>{ children }</span>
    </div>
  )
}