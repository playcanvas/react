import type { Entity } from 'playcanvas';
import { Script } from 'playcanvas';

const smoothStep = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : Math.sin((x - 0.5) * Math.PI) * 0.5 + 0.5);

class AutoRotator extends Script {
    static scriptName = 'autoRotator';

    speed = 4;
    pitchSpeed = 0;
    pitchAmount = 1;
    startDelay = 4;
    startFadeInTime = 5;
    timer = 0;
    pitch = 0;
    yaw = 0;

    update(dt: number): void {
        const entity = this.entity as Entity;

        // @ts-expect-error The script is actually dynamic but PlayCanvas types do not reflect this.
        const camera = entity?.script?.orbitCamera;
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

export { AutoRotator };
