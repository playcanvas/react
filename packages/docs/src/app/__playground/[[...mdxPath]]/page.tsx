import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Playground from '@/docs-components/Playground'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: PageProps) {
  const params = await props.params

  try {
      // Try to import the meta file
      const { default: metadata } = await import(`@/content/${params.mdxPath}.meta.tsx`)
      return metadata;
    } catch {
      // If the meta file is not found, use the default metadata
      const { metadata } = await importPage(params.mdxPath)
      return metadata
    }
}

interface PageProps {
  params: Promise<  {
    mdxPath?: string[]
  }>
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath)

  const source = await readFile(
    path.join(process.cwd(), 'src/content', `${params.mdxPath}.mdx`),
    'utf-8'
  )

  return (
    <div className='absolute top-0 left-0 w-screen h-screen'>
      <Playground name={`./${params.mdxPath}.tsx`} code={source} path={metadata.filePath}/>
    </div>
  )
}