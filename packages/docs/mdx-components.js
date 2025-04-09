import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Application, Entity } from '@playcanvas/react'
import { OrbitControls } from '@playcanvas/react/scripts'
import { Align, Light, Anim, Camera, Collision, EnvAtlas, GSplat, Script, Render, RigidBody } from '@playcanvas/react/components'

import ReactQueryProvider from '@/docs-components/ReactQueryProvider'

import EnvAtlasComponent from '@components/EnvAtlas'
import Grid from '@components/Grid'
import PostEffects, { StaticPostEffects} from '@components/PostEffects'
import ShadowCatcher from '@components/ShadowCatcher'
import AutoRotate from '@components/AutoRotate'
import { MotionEntity, MotionLight } from '@components/MotionEntity'
import { Glb } from '@components/Glb'
import { unstable_TSDoc as TSDoc } from 'nextra/tsdoc'
import { version } from 'playcanvas';
const PcVersion = () => <span>{version}</span>;

const docsComponents = getDocsMDXComponents({
  TSDoc(props) {
    return (
      <TSDoc
        {...props}
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

export const defaultComponents = {
  PcVersion,
  ReactQueryProvider,
  Application,
  Entity,
  Align, Anim, Camera, Collision, EnvAtlas, GSplat, Script, Render, RigidBody, Light,
  OrbitControls,
  EnvAtlasComponent,
  Grid,
  ShadowCatcher,
  PostEffects,
  StaticPostEffects,
  AutoRotate,
  MotionEntity,
  MotionLight,
  Glb
}

export function useMDXComponents(components) {
  return {
    ...components,
    ...defaultComponents,
    ...docsComponents
  }
}