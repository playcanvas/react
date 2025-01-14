
/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import './globals.css'
import { CodeXml } from 'lucide-react'
import ReactQueryProvider from '@/docs-components/ReactQueryProvider'

export const { viewport } = Head

export const metadata = {
  metadataBase: new URL('https://playcanvas.com'),
  title: {
    template: '%s - PlayCanvas React'
  },
  description: 'PlayCanvas React: Full featured 3D for React',
  applicationName: 'PlayCanvas React',
  generator: 'Next.js',
  appleWebApp: {
    title: 'PlayCanvas React'
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff'
  },
  twitter: {
    site: 'https://playcanvas.com'
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navbar = (
    <Navbar
      
      logo={
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-zinc-800 p-2 inline-block">
            <CodeXml size={24} strokeWidth={2} />
          </div>
          <span className='font-bold'>@playcanvas/react</span>
          <span style={{ opacity: '60%' }}>- Declarative 3D</span>
        </div>
      }
      // PlayCanvas discord server
      chatLink="https://discord.gg/EJuENf4hFj"

      // PlayCanvas GitHub
      projectLink="https://github.com/playcanvas/react"
    />
  )
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          banner={<Banner storageKey="0.2.0-release"><a href="https://github.com/playcanvas/react/releases/tag/v0.2.0" target="_blank" rel="noreferrer">
            🎉 <b>@playcanvas/react 0.2.0</b> is released. Read more →
          </a></Banner>}
          navbar={navbar}
          footer={<Footer>
            MIT {new Date().getFullYear()} ©{' '} PlayCanvas.
          </Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/playcanvas/react/blob/main/examples/docs"
          sidebar={{ 
            defaultMenuCollapseLevel: 1,
            toggleButton: true
          }}
          pageMap={await getPageMap()}
        >
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </Layout>
      </body>
    </html>
  )
}