import { readFiles, filePathRegex } from "@/docs-components/utils/file-utils";
import fs from 'fs/promises';
import path from 'path';

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
    let files = await readFiles(baseDir, '', false);
    const components = await readFiles(componentDir, 'src/components', false);

    // Merge the files and components
    files = { ...files, ...components };

    files["src/App.jsx"] = content 
      ? content // If content is provided, use it
      : await fs.readFile(path.resolve(path.join(process.cwd(), entry)), 'utf-8'); // If entry is provided, use it's content

    // Replace the baseUrl in the content
    const baseUrl = process.env.VERCEL_URL ?? 'https://playcanvas-react.vercel.app';
    files["src/App.jsx"] = files["src/App.jsx"].replace(
      filePathRegex, `$1${baseUrl}/$2`)

    files["jsconfig.json"] = JSON.stringify({
        "compilerOptions": {
            "baseUrl": ".",
            "paths": {
            "@/*": ["src/*"],
            "@/components/*": ["src/components/*"],
            }
        }
    }, null, 2);

    const pkJson = files["package.json"];
    delete files["package.json"];

    // return the files as json
    return new Response(JSON.stringify({ files, pkJson }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}