import fs from 'fs/promises';
import path from 'path';

export const filePathRegex = /(["'])\/((?!\/)[^"']*\.(?:glb|png|jpg|jpeg|gif|svg|mp4|webm|ogg|mp3|wav))/g

// Function to recursively read files in a directory
export async function readFiles(dir, relativeDir = '', useContent = true) {

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const fileMap = {};

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively read directories
      const nestedFiles = await readFiles(fullPath, path.join(relativeDir, entry.name), useContent);
      Object.assign(fileMap, nestedFiles);
    } else {
      // Skip .DS_Store files
      if (entry.name === '.DS_Store') {
        continue;
      }
      // Read the file contents
      if (entry.name.endsWith('.json')) {
        // Read and parse JSON files
        const jsonContent = await fs.readFile(fullPath, 'utf-8');
        const parsedContent = JSON.parse(jsonContent);
        fileMap[relativePath] = useContent ? { content: parsedContent } : parsedContent;
      } else {
        // Read other files as text
        const content = await fs.readFile(fullPath, 'utf-8');
        fileMap[relativePath] = useContent ? { content } : content;
      }
    }
  }
  return fileMap;
}