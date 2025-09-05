import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Playground from '@docs-components/Playground'
 
export const generateStaticParams = generateStaticParamsFor('mdxPath')
const EXAMPLES_PATH = 'examples'
// Limit this catch-all route to only the statically generated params so it
// doesn't intercept unrelated requests (e.g. /.well-known, static assets).
export const dynamicParams = false
 
export async function generateMetadata(props) {
  const params = await props.params

  const isExamples = params.mdxPath[0] === EXAMPLES_PATH;

  if (isExamples) {
    const fileName = params.mdxPath.slice(-1)[0];
    const contentPath = params.mdxPath.slice(0, 1);

    const source = await readFile(
      path.join(process.cwd(), 'content', ...contentPath, `${fileName}.meta.json`),
      'utf-8'
    )

    // We can't dynamically import with the full path. An error is thrown because the import is too dynamic.
    // const metaPath = path.join('@content', 'examples', `${fileName}.meta.tsx`)
    // const { default: metadata } = await import(metaPath);
    return JSON.parse(source);
  }

  try {
    const { metadata } = await importPage(params.mdxPath)
    return metadata
  } catch (error) {
    console.error(error)
    return null
  }
}
 
const Wrapper = getMDXComponents().wrapper
 
export default async function Page(props) {
  const params = await props.params

  try {
    const { default: MDXContent, toc, metadata } = await importPage(params.mdxPath)
    const isExamples = params.mdxPath[0] === EXAMPLES_PATH;

    if (isExamples) {
      const contentPath = params.mdxPath.slice(0, 1);
      const fileName = params.mdxPath.slice(-1)[0];

      const source = await readFile(
          path.join(process.cwd(), 'content', ...contentPath, `${fileName}.mdx`),
          'utf-8'
      )

      return (
          <div className='absolute top-0 left-0 w-screen h-[calc(100dvh-var(--nextra-navbar-height)-var(--nextra-banner-height))] pointer-events-none'>
              <Playground name={`./${params.mdxPath.join('/')}.tsx`} code={source} path={metadata.filePath}/>
          </div>
      )
    }
    
    return (
      <Wrapper toc={toc} metadata={metadata}>
        <MDXContent {...props} params={params} />
      </Wrapper>
    )
  } catch (error) {
    console.error(error)
    return <div>Error</div>
  }
}