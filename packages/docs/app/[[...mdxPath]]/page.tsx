import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Playground from '@docs-components/Playground'
 
export const generateStaticParams = generateStaticParamsFor('mdxPath')
const EXAMPLES_PATH = 'examples'
 
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

  const { metadata } = await importPage(params.mdxPath)
  return metadata
}
 
const Wrapper = getMDXComponents().wrapper
 
export default async function Page(props) {
  const params = await props.params

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
        <div className='absolute top-0 left-0 w-screen h-screen absolute top-0 left-0 w-screen h-screen pointer-events-none'>
            <Playground name={`./${params.mdxPath}.tsx`} code={source} path={metadata.filePath}/>
        </div>
    )
  }
  
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}