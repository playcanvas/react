import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
// import { Application, Entity } from '@playcanvas/react'
// import { OrbitControls } from '@playcanvas/react/scripts'
// import { Align, Light, Anim, Camera, Collision, EnvAtlas, GSplat, Script, Render, RigidBody } from '@playcanvas/react/components'
import { Application } from '@playcanvas/react'

import ReactQueryProvider from '@/docs-components/ReactQueryProvider'

import EnvAtlasComponent from '@components/EnvAtlas'
import Grid from '@components/Grid'
import PostEffects, { StaticPostEffects} from '@components/PostEffects'
import ShadowCatcher from '@components/ShadowCatcher'
import AutoRotate from '@components/AutoRotate'
import { MotionEntity, MotionLight } from '@components/MotionEntity'

export const defaultComponents = {
  ReactQueryProvider,
  Application
}

export function useMDXComponents(components) {
  return {
    ...components,
    ...defaultComponents
  }
}