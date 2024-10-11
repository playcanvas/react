import { Script } from "playcanvas";
import { MultiCamera } from "./multi-camera";

export class CameraControls extends Script {

    initialize () {

        const camera = this.app.root.findOne(node => node.camera);

        this.multiCamera = new MultiCamera(
            this.entity, 
            this.app.graphicsDevice.canvas, 
            { name: 'multi-camera' }
        );
        this.multiCamera.attach(camera);

    }

    focusOnEntity(entity, snap = false) {
        this.focus = entity;
        this.multiCamera.focusOnEntity(this.focus, snap);
    }

    update(dt) {
        this.multiCamera.update(dt);
    }
}