
/* eslint-env node */
import './globals.css'

import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { Circle } from 'lucide-react'
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
            <Circle size={24} strokeWidth={2} className='text-foreground'/>
          </div>
          <span className='font-bold'>@playcanvas/react</span>
          <span className='text-muted-foreground hidden lg:inline' style={{ opacity: '60%' }}>- Build 3D apps with React</span>
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
      <Head faviconGlyph="◍" >
        <link rel="icon" type="image/svg+xml" href="/pc-react-logo.svg" />
        <link rel="canonical" href="https://playcanvas-react.vercel.app" />
        <title>PlayCanvas React</title>
      </Head>
      <body>
        <Layout
          banner={<Banner storageKey="0.4.0-release"><a href="https://github.com/playcanvas/react/releases/tag/v0.4.0" target="_blank" rel="noreferrer">
            <b>@playcanvas/react 0.4.0</b> available now!
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
            <div data-vaul-drawer-wrapper >
              <div className="relative min-h-screen">
                {children}
              </div>
            </div>
          </ReactQueryProvider>
        </Layout>
      </body>
    </html>
  )
}