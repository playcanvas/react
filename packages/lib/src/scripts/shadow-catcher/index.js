import { Script, Entity, Layer, StandardMaterial, BLEND_NORMAL, SHADOW_VSM16, SHADOWUPDATE_REALTIME, CHUNKAPI_2_1 } from 'playcanvas';
import { warnOnce } from '../../utils/validation.ts';

const endPS = `
    litArgs_opacity = mix(light0_shadowIntensity, 0.0, shadow0);
    gl_FragColor.rgb = vec3(0.0);
`;

/**
 * @deprecated This script is deprecated and will be removed in the next major version.
 * 
 * Use {@link https://github.com/playcanvas/engine/tree/main/scripts/esm/shadow-catcher.mjs | ShadowCatcher} from `playcanvas` instead.
 * 
 * ```tsx
 * import { ShadowCatcher } from "playcanvas/scripts/esm/shadow-catcher.mjs";
 *
 * export const MyScript = () => <Script script={ShadowCatcher} />;
 * ```
 */
export class ShadowCatcher extends Script {
    static scriptName = 'shadowCatcher';
    /**
     * The shadow distance of the shadow catcher light.
     * @type {number}
     */
    shadowDistance = 16;

    /**
     * The VSM blur size of the shadow catcher light.
     * @type {number}
     */
    vsmBlurSize = 32;

    /**
     * The width of the shadow catcher.
     * @type {number}
     */
    width = 1;

    /**
     * The depth of the shadow catcher.
     * @type {number}
     */
    depth = 1;

    /** @type {Layer|null} */
    layer = null;

    /** @type {StandardMaterial|null} */
    material = null;

    /** @type {Entity|null} */
    plane = null;

    /** @type {Entity|null} */
    light = null;

    initialize() {
        warnOnce('This script is deprecated and will be removed in the next major version. Use the `ShadowCatcher` from `playcanvas` instead.');

        // create and add the shadow layer
        this.layer = new Layer({
            name: 'Shadow Layer'
        });

        const layers = this.app.scene.layers;
        const worldLayer = layers.getLayerByName('World');
        const idx = layers.getTransparentIndex(worldLayer);
        layers.insert(this.layer, idx + 1);

        // create shadow catcher material
        this.material = new StandardMaterial();
        this.material.useSkybox = false;
        this.material.useEnvAtlas = false;
        this.material.blendType = BLEND_NORMAL;
        this.material.depthWrite = true;
        this.material.depthTest = true;
        this.material.diffuse.set(0, 0, 0);
        this.material.specular.set(0, 0, 0);
        this.material.chunks = {
            APIVersion: CHUNKAPI_2_1,
            endPS: endPS
        };
        this.material.update();

        // create shadow catcher geometry
        this.plane = new Entity('ShadowPlane');
        this.plane.addComponent('render', {
            type: 'plane',
            castShadows: false,
            material: this.material
        });
        this.plane.setLocalScale(this.width, 1, this.depth);

        // create shadow catcher light
        this.light = new Entity('ShadowLight');
        this.light.addComponent('light', {
            type: 'directional',
            castShadows: true,
            normalOffsetBias: 0,
            shadowBias: 0,
            shadowDistance: this.shadowDistance,
            shadowResolution: 1024,
            shadowType: SHADOW_VSM16,
            shadowUpdateMode: SHADOWUPDATE_REALTIME,
            vsmBlurSize: 16,
            shadowIntensity: 0.75,
            intensity: 1
        });

        this.app.root.addChild(this.plane);
        this.app.root.addChild(this.light);

        // add the shadow layer to the camera
        const cameras = this.app.root.findComponents('camera');
        cameras.forEach((camera) => {
            camera.layers = camera.layers.concat([this.layer.id]);
        });

        this.entity.findComponents('render').forEach((component) => {
            this.layer.shadowCasters = this.layer.shadowCasters.concat(component.meshInstances);
        });

        this.on('destroy', () => {
            this.plane.remove();
            this.light.remove();
            this.plane.destroy();
            this.light.destroy();
            this.material.destroy();
            layers.remove(this.layer);

            const camera = this.app.root?.findOne(node => node?.camera?.enabled)?.camera;
            if (!camera) return;

            camera.layers = camera.layers.filter(layer => layer !== this.layer.id);
        });
    }
}