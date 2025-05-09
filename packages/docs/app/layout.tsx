
/* eslint-env node */
import './globals.css'

import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { CodeXml } from 'lucide-react'
import ReactQueryProvider from '@docs-components/ReactQueryProvider'

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
    site: 'https://twitter.com/playcanvas'
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navbar = (
    <Navbar
      
      logo={
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-background p-2 inline-block">
            <CodeXml size={24} strokeWidth={2} className='text-foreground'/>
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
          banner={<Banner storageKey="0.3.0-release"><a href="https://github.com/playcanvas/react/releases/tag/v0.3.0" target="_blank" rel="noreferrer">
            🎉 <b>@playcanvas/react 0.3.0!</b> Now with <b>React 19</b> support. Read more →
          </a></Banner>}
          navbar={navbar}
          footer={<Footer>
            MIT {new Date().getFullYear()} ©{' '} PlayCanvas.
          </Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/playcanvas/react/tree/main/packages/docs"
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