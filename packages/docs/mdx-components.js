import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Application, Entity } from '@playcanvas/react'
import { OrbitControls } from '@playcanvas/react/scripts'
import { Align, Light, Anim, Camera, Collision, EnvAtlas, GSplat, Script, Render, RigidBody } from '@playcanvas/react/components'

import EnvAtlasComponent from '@components/EnvAtlas'
import GlbAsset from '@components/GlbAsset'
import Grid from '@components/Grid'
import PostEffects, { StaticPostEffects} from '@components/PostEffects'
import ShadowCatcher from '@components/ShadowCatcher'
import AutoRotate from '@components/AutoRotate'
import ReactQueryProvider from '@/components/react-query-provider'
import { MotionEntity, MotionLight } from '@components/MotionEntity'
const docsComponents = getDocsMDXComponents()

export const defaultComponents = {
  ReactQueryProvider,
  Application,
  Entity,
  Align, Anim, Camera, Collision, EnvAtlas, GSplat, Script, Render, RigidBody, Light,
  OrbitControls,
  EnvAtlasComponent,
  GlbAsset,
  Grid,
  ShadowCatcher,
  PostEffects,
  StaticPostEffects,
  AutoRotate,
  MotionEntity,
  MotionLight
}

export function useMDXComponents(components) {
  return {
    ...components,
    ...defaultComponents,
    ...docsComponents
  }
}