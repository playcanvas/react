import {
    BLEND_NORMAL,
    CHUNKAPI_1_65,
    SHADOW_VSM16 as SHADOW_TYPE,
    SHADOWUPDATE_REALTIME as SHADOWUPDATE,
    Entity,
    Layer,
    StandardMaterial,
    BoundingBox,
    Script,
    Vec3,
    CHUNKAPI_2_1,
    LIGHTSHAPE_RECT,
    Color,
    LIGHTFALLOFF_INVERSESQUARED,
    SHADOW_PCSS
} from 'playcanvas';

const endPS = `
    litArgs_opacity = mix(light0_shadowIntensity, 0.0, shadow0);
    gl_FragColor.rgb = vec3(0.0, 0.0, 0.0);
`;

const tmpMin = new Vec3()
const tmpMax = new Vec3()

class ShadowCatcher extends Script {

    layer;
    material;
    plane;
    light;
    
    sceneBounds = new BoundingBox();

    initialize() {
        // create and add the shadow layers
        this.layer = new Layer({ name: 'Shadow Layer'});

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

        // create shadow catcher light
        this.light = new Entity('ShadowLight');
        this.light.addComponent('light', {
            type: 'directional',
            castShadows: true,
            normalOffsetBias: 0,
            shadowBias: 0.0,
            shadowResolution: 1024,
            shadowType: SHADOW_TYPE,
            shadowUpdateMode: SHADOWUPDATE,
            vsmBlurSize: 32,
            enabled: true,
            shadowIntensity: 1,
            intensity: 0.5
        });

        this.entity.addChild(this.plane);
        this.entity.addChild(this.light);

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

        this.on('enable', () => {
            this.layer.enabled = true;
            this.light.enabled = true;
        })

        this.on('disable', () => {
            this.layer.enabled = false;
            this.light.enabled = false;
        })

    }
        
    update() {

        const camera = this.app.root.findOne(node => node?.camera?.enabled)?.camera;

        if(!camera) return;

        const renderComponents = this.entity.findComponents('render');

        // Set the shadowCasters on the layer
        const meshInstances = renderComponents.reduce((arr, component) => ([...arr, ...component.meshInstances]), []);
        meshInstances.forEach(mi => mi.castShadow = true)
        this.layer.addShadowCasters(meshInstances);

        this.sceneBounds.center.set(0, 0, 0);
        this.sceneBounds.halfExtents.set(0.5, 0.5, 0.5);

        // Iterate over the components and calculate a scene boundary for all entities
        const sceneBounds = renderComponents.reduce((bounds, component) => {
            const entity = component.entity;
            const position = entity.getPosition();
            tmpMin.copy(bounds.getMin()).min(position);
            tmpMax.copy(bounds.getMax()).max(position);
            bounds.setMinMax(tmpMin, tmpMax);
            return bounds
        }, this.sceneBounds );

        const bound = sceneBounds;
        const center = bound.center;
        const len = Math.sqrt(bound.halfExtents.x * bound.halfExtents.x + bound.halfExtents.z * bound.halfExtents.z);

        this.plane.setLocalScale(len * 10, 1, len * 10);
        this.plane.setPosition(center.x, 0, center.z);

        if(!camera.layers.includes(this.layer.id)) {
            camera.layers = [...camera.layers, this.layer.id];
        }

        this.light.light.shadowDistance = camera.farClip;
    }


    set intensity(value) {
        if(this.light?.light) {
            this.light.light.shadowIntensity = value;
        }
    }

    get intensity() {
        return this.light?.light?.shadowIntensity;
    }

    set rotation(euler) {
        this.light.setEulerAngles(euler);
    }

    get rotation() {
        return this.light.getEulerAngles();
    }
}

export { ShadowCatcher }