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
      <div className='absolute top-[var(--nextra-navbar-height)] left-0 w-full h-[calc(100vh-var(--nextra-navbar-height))]'>
        <Playground name={`./${params.mdxPath}.tsx`} code={source} />
        <div id='page-metadata' className='absolute p-4 z-10'>
          <h1>{metadata.title}</h1>
          <p>{metadata.description}</p>
          <p>{metadata.timestamp && new Date(metadata.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </ReactQueryProvider>
  )
}