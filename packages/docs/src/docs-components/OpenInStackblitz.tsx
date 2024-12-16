'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, LoaderCircle, FileStackIcon as StackBlitzIcon} from 'lucide-react';
import { Cards } from 'nextra/components';
// If StackBlitzIcon is not available in lucide-react, you can create a custom icon or use an alternative
// import { ReactComponent as StackBlitzIcon } from './path-to-your-stackblitz-icon.svg'; // Replace with your icon path

const useStackBlitz = (template: string, content?: string, entry?: string) => useQuery({
  queryKey: ['api/stackblitz', template],
  queryFn: () => fetch(`/api/stackblitz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, content, entry })
  }).then(res => res.json())
});


// Button component to open the StackBlitz project
export const StackBlitzButton = ({ template, content, entry }) => {
  const { data: files, error, isLoading } = useStackBlitz(template, content, entry);


  if (error) {
    return (
      <button disabled className="btn-error">
        Error creating StackBlitz project
      </button>
    );
  }

  if (isLoading) {
    return (
      <button disabled className="btn-loading">
        Loading...
      </button>
    );
  }

  return (
    <form 
        method="post"
        action="https://stackblitz.com/run"
        target="_blank"
    >
        <button type="submit" className="btn-primary">
            <StackBlitzIcon className="mr-2" /> Open in StackBlitz
        </button>
    </form>
  );
};

// Card component example to display project status
export const OpenHomePageExampleInStackBlitz = () => {
    // Adjust the template and entry as per your project structure
    const { data: project, error, isLoading } = useStackBlitz(
        'vite-react',
        null, // Optional content for the entry file
        '/src/templates/HomePageExample.jsx' // Entry file path
    );

    if (error) {
        return (
            <Cards.Card
            className="pointer-events-none"
            icon={<AlertTriangle />}
            title="Error creating StackBlitz project"
            href="#"
            />
        );
    }

    if (isLoading) {
        return (
            <Cards.Card
            className="pointer-events-none opacity-60"
            icon={<LoaderCircle className="animate-spin" />}
            title="Creating StackBlitz project..."
            href="#"
            />
        );
    }

    const { files, pkJson } = project;

    console.log(JSON.stringify(pkJson.dependencies, null, 2));

    return (
        <form 
            method="post"
            action="https://stackblitz.com/run"
            target="_blank"
        >
            <input type="hidden" name="project[title]" value="@playcanvas/react - Example" />
            <input type="hidden" name="project[description]" value="A Model Viewer Example" />
            <input type="hidden" name="project[template]" value="node" />
            <input
                type="hidden"
                name="project[files][package.json]"
                value={JSON.stringify(pkJson, null, 2)}
            />
            <input
                type="hidden" name="project[settings]" value='{"compile":{"clearConsole":false}}'
            />
            {
                Object.entries(files).map(([path, content]) => (
                    <input 
                        key={path} 
                        type="hidden" 
                        name={`project[files][${path}]`} 
                        value={content as string} 
                    />
                ))
            }
            <button type="submit" className="btn-primary">
                {/* <StackBlitzIcon className="mr-2" />  */}
                Open in StackBlitz
            </button>
        </form>
    );



//   return (
//     <Cards.Card
//       icon={<StackBlitzIcon />}
//       title="Open in StackBlitz"
//       href={stackblitzUrl}
//       target="_blank"
//       rel="noopener noreferrer"
//     />
//   );
};