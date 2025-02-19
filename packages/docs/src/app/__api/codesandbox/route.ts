import { readFiles } from "@/docs-components/utils/file-utils";
import path from "path";


export async function POST(request: Request) {
  try {
    // Get template and content from request body
    const { template, content, entry } = await request.json();

    let error = null;
    if(!template) {
      error = '`template` is required';
    }

    if(!entry && !content) {
      error = '`entry` or `content` is required';
    }

    if(error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Base directory for the files
    const baseDir = path.resolve(path.join(process.cwd(), 'src/templates', template));
    const componentDir = path.resolve(path.join(process.cwd(), 'src/components/'));

    // Get all files starting from the base directory
    let files = await readFiles(baseDir);
    const components = await readFiles(componentDir, 'src/components');

    // Merge the files and components
    files = { ...files, ...components };

    files["/src/App.jsx"] = content 
      ? { content } // If content is provided, use it
      : { content : await fs.readFile(path.resolve(path.join(process.cwd(), entry)), 'utf-8') }; // If entry is provided, use it's content

    // Replace the baseUrl in the content
    const baseUrl = process.env.VERCEL_URL ?? 'https://playcanvas-react.vercel.app';
    files["/src/App.jsx"].content = files["/src/App.jsx"].content.replace(
      filePathRegex, `$1${baseUrl}/$2`)

    files["/jsconfig.json"] = {
      content: {
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@/*": ["src/*"],
            "@/components/*": ["src/components/*"],
          }
        }
      }
    };

    // Call the CodeSandbox Define API
    const response = await fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ files })
    });

    if (!response.ok) {
      throw new Error(`CodeSandbox API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    if (!data.sandbox_id) {
      throw new Error('Invalid response from CodeSandbox API');
    }

    return new Response(
      `https://codesandbox.io/s/${data.sandbox_id}?file=%2Fsrc%2FApp.jsx`
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}