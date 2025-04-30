'use client'
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CodesandboxIcon, LoaderCircle } from 'lucide-react';
import { Cards } from 'nextra/components';

const useCodeSandbox = (template: string, content?: string, entry?: string) => useQuery({
  queryKey: ['api/codesandbox', template],
  queryFn: () => fetch(`/api/codesandbox`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, content, entry })
  }).then(res => res.text())
});

export const CodeSandboxButton = ({ template, content, entry }: { template: string, content?: string, entry?: string }) => {
  
  const { data: sandboxUrl, error, isPending } = useCodeSandbox(template, content, entry);

  if(error) {
    return <button disabled>Error creating sandbox</button>;
  }

  if(isPending) {
    return <button disabled>Loading...</button>;
  }

  return <a target="_blank" rel="noopener noreferrer" href={sandboxUrl}>Open in CodeSandbox</a>;
}

export const OpenHomePageExampleInCodeSandbox = () => {
  const { data: sandboxUrl, error, isPending } = useCodeSandbox('javascript', null, "/src/templates/HomePageExample.jsx");

  if(error) {
    return <Cards.Card className='pointer-events-none'
      icon={<AlertTriangle />}
      title="Error creating sandbox"
      href=''
    />
  }

  if(isPending) {
    return <Cards.Card className='pointer-events-none opacity-60'
      icon={<LoaderCircle className='animate-spin'/>}
      title="Open in CodeSandbox"
      href=''
    />
  }

  return <Cards.Card
    icon={<CodesandboxIcon />}
    title="Open in CodeSandbox"
    href={sandboxUrl}
  />
}