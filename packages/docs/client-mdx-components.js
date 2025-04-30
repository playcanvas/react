import { Application, Entity } from '@playcanvas/react'
import { OrbitControls } from '@playcanvas/react/scripts'
import { Align, Light, Anim, Camera, Collision, EnvAtlas, GSplat, Script, Render, RigidBody } from '@playcanvas/react/components'

import ReactQueryProvider from '@docs-components/ReactQueryProvider'

import EnvAtlasComponent from '@components/EnvAtlas'
import Grid from '@components/Grid'
import PostEffects, { StaticPostEffects} from '@components/PostEffects'
import ShadowCatcher from '@components/ShadowCatcher'
import AutoRotate from '@components/AutoRotate'
import { MotionEntity, MotionLight } from '@components/MotionEntity'
import { Glb } from '@components/Glb'

import { version } from 'playcanvas';
const PcVersion = () => <span>{version}</span>;

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