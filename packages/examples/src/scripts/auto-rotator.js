import { Script } from "playcanvas";

const smoothStep = (x) => (x <= 0) ? 0 : (x >= 1) ? 1 : Math.sin((x - 0.5) * Math.PI) * 0.5 + 0.5;

class AutoRotator extends Script  {

  speed = 4;
  pitchSpeed = 0;
  pitchAmount = 1;
  startDelay = 4;
  startFadeInTime = 5;

  update(dt){
    const camera = this.entity.script.orbitCamera;
    if (!camera) {
        return;
    }

    if (this.pitch !== camera.pitch || this.yaw !== camera.yaw) {
        // camera was moved
        this.pitch = camera.pitch;
        this.yaw = camera.yaw;
        this.timer = 0;
    } else {
        this.timer += dt;
    }

    if (this.timer > this.startDelay) {
        // animate still camera
        const time = this.timer - this.startDelay;
        const fadeIn = smoothStep(time / this.startFadeInTime);

        this.yaw += dt * fadeIn * this.speed;
        this.pitch += Math.sin(time * this.pitchSpeed) * dt * fadeIn * this.pitchAmount;

        camera.yaw = this.yaw;
        camera.pitch = this.pitch;
    }
  }
}

export { AutoRotator }