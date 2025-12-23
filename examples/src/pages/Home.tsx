import { Link } from 'react-router-dom'

const examples = [
  {
    path: '/simple-splat',
    title: 'Simple Splat',
    description: 'Gaussian Splat with orbit controls, shadows, and a grid'
  },
  {
    path: '/lod-streaming',
    title: 'LOD Streaming',
    description: 'Level-of-detail streaming with radial reveal effect'
  }
]

function Home() {
  return (
    <div className="min-h-screen px-10 py-15 overflow-y-auto bg-[linear-gradient(180deg,#0a0a0f_0%,#12121a_100%)] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,95,31,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(255,140,0,0.06)_0%,transparent_50%)] before:pointer-events-none relative">
      <header className="text-center mb-15 relative z-10">
        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-br from-brand via-brand-gold to-brand-light bg-clip-text text-transparent mb-3">
          PlayCanvas React Examples
        </h1>
        <p className="text-lg text-text-muted font-normal">
          Explore interactive demos built with @playcanvas/react
        </p>
      </header>
      
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 max-w-[900px] mx-auto relative z-10">
        {examples.map((example) => (
          <Link 
            key={example.path} 
            to={example.path} 
            className="block p-8 bg-linear-to-br from-white/3 to-white/1 border border-brand/15 rounded-2xl no-underline text-inherit transition-all duration-300 ease-out hover:bg-linear-to-br hover:from-brand/8 hover:to-brand-light/4 hover:border-brand/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_60px_rgba(255,107,53,0.1)] group"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-100">
              {example.title}
            </h2>
            <p className="text-sm text-text-dim leading-relaxed mb-5">
              {example.description}
            </p>
            <span className="text-sm text-brand font-medium transition-colors duration-200 group-hover:text-brand-light">
              View Example →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
