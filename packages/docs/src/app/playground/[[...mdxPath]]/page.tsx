import { generateStaticParamsFor, importPage } from 'nextra/pages'
import fs from 'node:fs'
import path from 'node:path'
import Playground from '@/components/playground'
import ReactQueryProvider from '@/components/react-query-provider'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

interface PageProps {
  params: Promise<  {
    mdxPath?: string[]
  }>
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const result = await importPage(params.mdxPath)
  const { metadata } = result;

  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/content', `${params.mdxPath}.mdx`),
    'utf-8'
  )

  return (
    <ReactQueryProvider>
      <div className='absolute top-0 left-0 w-screen h-screen'>
        <Playground name={`./${params.mdxPath}.tsx`} code={source} path={metadata.filePath}/>
        {/* <div id='page-metadata' className='absolute w-full text-right top-[var(--nextra-navbar-height)] p-12 px-16 '>
          <h1 className='text-lg font-semibold'>{metadata.title}</h1>
          <p className='text-sm opacity-50'>{metadata.description}</p>
          <p className='text-xs opacity-50'>{metadata.timestamp && new Date(metadata.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <button 
            title="View on GitHub"
            className='w-9 h-9 inline-block mt-2 text-sm px-2 py-2 bg-transparent hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors'>
            <a href={`https://github.com/playcanvas/react/tree/main/packages/docs/${metadata.filePath}`} target="_blank" rel="noopener noreferrer">
              <Icons.gitHub className='w-full h-full opacity-60' />
            </a>
          </button>
        </div> */}
      </div>
    </ReactQueryProvider>
  )
}