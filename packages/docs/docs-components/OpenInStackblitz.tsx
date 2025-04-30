'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, LoaderCircle, ZapIcon } from 'lucide-react';
import { Cards } from 'nextra/components';

const useStackBlitz = (template: string, content?: string, entry?: string) => useQuery({
  queryKey: ['api/stackblitz', template],
  queryFn: () => fetch(`/api/stackblitz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, content, entry })
  }).then(res => res.json())
});

// Card component example to display project status
export const OpenHomePageExampleInStackBlitz = () => {
    // Adjust the template and entry as per your project structure
    const { data: project, error, isLoading } = useStackBlitz(
        'javascript',
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
            <button type="submit" className="btn-primary" onClick={(e) => {
                    e.currentTarget.closest('form')?.submit();
                }}>
                <Cards.Card
                    icon={<ZapIcon   />}
                    title="Open in StackBlitz"
                    href="#"
                />
            </button>
        </form>
    );
};