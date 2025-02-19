
/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import './globals.css'
import { CodeXml } from 'lucide-react'
import ReactQueryProvider from '@/docs-components/ReactQueryProvider'
import { Application, PlayCanvasCanvas } from '@playcanvas/react'
import { FC, ReactNode } from 'react'

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
          <span style={{ opacity: '60%' }}>Simple 3D for the Web</span>
        </div>
      }
      // PlayCanvas discord server
      chatLink="https://discord.gg/hEM84NMkRv"

      // PlayCanvas GitHub
      projectLink="https://github.com/playcanvas/react"
    />
  )
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        {/* <Layout
          footer={<Footer />}
          navbar={navbar}
          pageMap={await getPageMap()}
        > */}
          <ReactQueryProvider>
          {/* {className='hover:cursor-grab active:cursor-grabbing w-full'} */}
            {children}
          </ReactQueryProvider>
        {/* </Layout> */}
      </body>
    </html>
  )
}

// // // const RootLayout: FC<{ children: ReactNode }> = async ({ children }) => {
// // //   return (
// // //     <html lang="en" dir="ltr">
// // //       <Head faviconGlyph="✦" />
// // //       <body style={{ margin: 0 }}>
// // //       <div style={{ display: 'flex' }}>
// // //         {/* <ReactQueryProvider> */}
// // //           {children}
// // //         {/* </ReactQueryProvider> */}
// // //       </div>
// // //       <Footer />
// // //       </body>
// // //     </html>
// // //   )
// // // }
// // // export default function MyLayout({ children, ...props }) {
// // //   return (
// // //     <html lang="en">
// // //       <body>
// // //         <Layout
// // //           navbar={}
// // //           sidebar={{ autoCollapse: true }}
// // //           docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
// // //         >
// // //           {children}
// // //         </Layout>
// // //       </body>
// // //     </html>
// // //   )
// // // }

// // // export default RootLayout

// import { Footer, Layout, Navbar } from 'nextra-theme-docs'
// import { Banner, Head } from 'nextra/components'
// import { getPageMap } from 'nextra/page-map'
// import 'nextra-theme-docs/style.css'
 
// export const metadata = {
//   // Define your metadata here
//   // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
// }
 
// const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>
// const navbar = (
//   <Navbar
//     logo={<b>Nextra</b>}
//     // ... Your additional navbar options
//   />
// )
// const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>
 
// export default async function RootLayout({ children }) {

//   const pageMap = await getPageMap();
//   console.log(pageMap)

//   return (
//     <html
//       // Not required, but good for SEO
//       lang="en"
//       // Required to be set
//       dir="ltr"
//       // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
//       suppressHydrationWarning
//     >
//       <Head
//       // ... Your additional head options
//       >
//         {/* Your additional tags should be passed as `children` of `<Head>` element */}
//       </Head>
//       <body>
//         <Layout
//           banner={banner}
//           navbar={navbar}
//           pageMap={pageMap}
//           docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
//           footer={footer}
//           // ... Your additional layout options
//         >
//           {children}
//         </Layout>
//       </body>
//     </html>
//   )
// }

// import { Footer, Layout, Navbar } from 'nextra-theme-docs'
// import { Banner, Head } from 'nextra/components'
// import { getPageMap } from 'nextra/page-map'
// import 'nextra-theme-docs/style.css'
 
// export const metadata = {
//   // Define your metadata here
//   // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
// }
 
// const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>
// const navbar = (
//   <Navbar
//     logo={<b>Nextra</b>}
//     // ... Your additional navbar options
//   />
// )
// const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>
 
// export default async function RootLayout({ children }) {
//   return (
//     <html
//       // Not required, but good for SEO
//       lang="en"
//       // Required to be set
//       dir="ltr"
//       // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
//       suppressHydrationWarning
//     >
//       <Head
//       // ... Your additional head options
//       >
//         {/* Your additional tags should be passed as `children` of `<Head>` element */}
//       </Head>
//       <body>
//         <Layout
//           banner={banner}
//           navbar={navbar}
//           pageMap={await getPageMap()}
//           docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
//           footer={footer}
//           // ... Your additional layout options
//         >
//           {children}
//         </Layout>
//       </body>
//     </html>
//   )
// }