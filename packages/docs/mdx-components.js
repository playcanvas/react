import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

import { TSDoc, generateDefinition } from 'nextra/tsdoc'
import { defaultComponents } from './client-mdx-components';
import { Badge } from '@/components/ui/badge';
import { OpenInV0Button } from '@/components/ui/open-in-v0-button';
import { Check, Dash } from '@/components/Check';
import { Viewer } from '@playcanvas/blocks';

const docsComponents = getDocsMDXComponents({
  TSDoc(props) {
    return (
      <TSDoc
        definition={generateDefinition(props)}
        typeLinkMap={{
          ReactNode:
            'https://github.com/DefinitelyTyped/DefinitelyTyped/blob/51fcf2a1c5da6da885c1f8c11224917bbc011493/types/react/index.d.ts#L426-L439',
          ReactElement:
            'https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d44fce6cd8765acbdb0256195e5f16f67471430d/types/react/index.d.ts#L315-L322',
        }}
      />
    )
  }
})

export function useMDXComponents(components) {
  return {
    Check,
    Dash,
    Badge,
    OpenInV0Button,
    Viewer,
    ...components,
    ...defaultComponents,
    ...docsComponents
  }
}