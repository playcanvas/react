import { Link } from 'react-router-dom'

interface BackLinkProps {
  to?: string
  children?: React.ReactNode
}

export function BackLink({ to = '/', children = '← Back to Examples' }: BackLinkProps) {
  return (
    <Link 
      to={to} 
      className="absolute top-5 left-5 z-[1000] px-4 py-2.5 bg-black/75 backdrop-blur-sm border border-white/10 rounded-lg text-gray-200 no-underline text-sm font-medium transition-all duration-200 hover:bg-brand/15 hover:border-brand/40 hover:text-brand"
    >
      {children}
    </Link>
  )
}

