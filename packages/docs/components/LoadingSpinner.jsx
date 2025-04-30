import { Entity } from '@playcanvas/react'
import { Script, Render, Camera, Light } from '@playcanvas/react/components'
import { Script as PcScript } from 'playcanvas'

class Spin extends PcScript {
  update(dt) {
    this.entity.rotate(0, this.speed * dt, 0)
  }
}

/**
 * A simple spinning cube used as a loading indicator.
 */
export const LoadingSpinner = () => (<>
    <Entity name='light' >
      <Light type='directional' color="orange" />
    </Entity>
    <Entity name="camera" position={[0, 0, 50]}>
      <Camera />
    </Entity>
    <Entity name="loading">
      <Render type="box"/>
      <Script script={Spin} speed={10}/>
    </Entity>
</>)