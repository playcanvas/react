import { EnvLighting, Quat, Scene, Sky, SKYTYPE_DOME, SKYTYPE_INFINITE, Texture } from "playcanvas";
import { useEffect, useRef } from "react";
import { useApp } from "../hooks/use-app.tsx";
import { createComponentDefinition, getStaticNullApplication, Schema, validatePropsWithDefaults, warnOnce } from "../utils/validation.ts";
import { PublicProps } from "../utils/types-utils.ts";
import { Asset } from "playcanvas";
import dedent from "dedent";

const appUUIDs = new Set<string>();

/**
 * @beta    
 * Environment component

 * The Environment component is used to set the environment lighting and skybox.
 * 
 * @example
 * ```tsx
 * <Environment />
 * ```
 */
function Environment(props: EnvironmentProps) {

    const app = useApp();
 
    // split the sky props and scene props
    const { center, scale, rotation, depthWrite, type, ...sceneProps } = props;
    const skyProps = { center, scale, rotation, depthWrite, type };

    // Sanitize and validate the props
    const safeSceneProps = validatePropsWithDefaults(sceneProps, sceneComponentDefinition);
    const safeSkyProps = validatePropsWithDefaults(skyProps, skyComponentDefinition);

    /**
     * We want to ensure that the environment is only set once per app instance.
     * This is because the environment is a global state and we don't want to
     * set it multiple times.
     * 
     * If multiple components are used in the same app instance, we will warn the user
     * and only the first component will be used.
     */
    const appHasEnvironment = useRef(false);
    useEffect(() => {
        const appUUID = app.root.getGuid();
        const hasEnvironment = appUUIDs.has(appUUID);
        appUUIDs.add(appUUID);
        appHasEnvironment.current = hasEnvironment;

        if (hasEnvironment) {
            warnOnce(
                dedent`Multiple \`<Environment/>\` components have been mounted.
                Only the first \`<Environment/>\` component will be used.`
            );
        }
        
        return () => {
            appUUIDs.delete(appUUID);
        }
    })

    /**
     * Sets the skybox of the environment.
     */
    useEffect(() => {
        // If the app already has an environment, don't override it
        if (appHasEnvironment.current) return;

        const skyBoxAsset = safeSceneProps.skybox as Asset;

        const isCubeMap = Array.isArray(skyBoxAsset.resources) && skyBoxAsset.resources.length === 6;
        let skybox: Texture = skyBoxAsset.resource as Texture;
        
        // If the skybox is not a cube map, try to generate a cube map from it.
        if (!isCubeMap) {
            skybox = EnvLighting.generateSkyboxCubemap(skyBoxAsset.resource as Texture);
        }
    
        app.scene.skybox = skybox;  

        return () => {
            if (app?.scene) {
                app.scene.skybox = null;
            }
        };
    }, [appHasEnvironment.current, safeSceneProps.skybox?.id]);


    /**
     * Sets the environment lighting.
     */
    useEffect(() => {
        // If the app already has an environment, don't override it
        if (appHasEnvironment.current) return;

        app.scene.envAtlas = safeSceneProps?.envAtlas?.resource as Texture ?? null;

        return () => {
            if (app?.scene) {
                app.scene.envAtlas = null;
            }
        };
    }, [appHasEnvironment.current, safeSceneProps.envAtlas?.id]);

    /**
     * Sets the remaining environment settings.
     */
    useEffect(() => {   
        if (appHasEnvironment.current) return;

        app.scene.exposure = safeSceneProps.exposure ?? 1;
        app.scene.envAtlas = safeSceneProps.envAtlas?.resource as Texture ?? null;
        
        if (safeSkyProps.rotation) {
            app.scene.skyboxRotation = new Quat().setFromEulerAngles(safeSkyProps.rotation[0], safeSkyProps.rotation[1], safeSkyProps.rotation[2]);
        }
        
        if (safeSkyProps.scale) {
            app.scene.sky.node.setLocalScale(...safeSkyProps.scale);
        }
        
        if (safeSkyProps.position) {
            app.scene.sky.node.setLocalPosition(...safeSkyProps.position); 
        }
        
        if (safeSkyProps.center) {
            app.scene.sky.center.set(...safeSkyProps.center);
        }
        
        app.scene.sky.type = safeSkyProps.type ?? SKYTYPE_DOME;
        app.scene.sky.depthWrite = safeSkyProps.depthWrite ?? true;

        // Set the skybox mip level
        app.scene.skyboxMip = safeSceneProps.skyboxMip ?? 0;
        app.scene.skyboxLuminance = safeSceneProps.skyboxLuminance ?? 1;
        app.scene.skyboxIntensity = safeSceneProps.skyboxIntensity ?? 1;
        app.scene.skyboxHighlightMultiplier = safeSceneProps.skyboxHighlightMultiplier ?? 1;

        return () => {
            
            /**
             * We have hardcoded the default values for the scene and sky in order to reset them
             * 
             * This isn't perfect as any changes the the engine defaults will break this.
             * TODO: Find a better way to reset the scene and sky.
             */

            if (app.scene) {
                app.scene.exposure = 1;
                app.scene.skyboxRotation = new Quat().setFromEulerAngles(0, 0, 0);
                app.scene.sky.node.setLocalScale(1, 1, 1);
                app.scene.sky.node.setLocalPosition(0, 0, 0);
                app.scene.sky.center.set(0, 0.05, 0);   
                app.scene.sky.type = SKYTYPE_INFINITE;
                app.scene.sky.depthWrite = false;
                app.scene.skyboxMip = 0;
                app.scene.skyboxLuminance = 0;
                app.scene.skyboxIntensity = 1;
                app.scene.skyboxHighlightMultiplier = 1;
            }
        };

    }, [
        appHasEnvironment.current, 
        safeSceneProps.exposure, 
        safeSkyProps.type,
        safeSkyProps.depthWrite,
        safeSceneProps.skyboxMip,
        safeSceneProps.skyboxLuminance,
        safeSceneProps.skyboxIntensity,
        safeSceneProps.skyboxHighlightMultiplier,

        // compute keys for scale, rotation, and center
        `scale-${safeSkyProps.scale?.join('-')}`, 
        `rotation-${safeSkyProps.rotation?.join('-')}`,
        `center-${safeSkyProps.center?.join('-')}`, 
        
    ]);

    return null
};


// Types
type SceneProps = Omit<Partial<PublicProps<Scene>>, 'skybox' | 'envAtlas'> & {
    /**
     * The skybox asset.
     * Used to set the skybox of the environment.
    */
   skybox?: Asset | null
   /**
    * The environment lighting.
    * Used to set the lighting of the environment.
   */
  envAtlas?: Asset | null
  
}

type SkyProps = Omit<Partial<PublicProps<Sky>>, 'node' | 'center'> & {
    /**
     * The scale of the sky.
     */
    scale?: [number, number, number]
    /**
     * The position of the sky.
     */
    position?: [number, number, number]
    /**
     * The center of the sky.
     */
    center?: [number, number, number]
    /**
     * The rotation of the sky.
     */
    rotation?: [number, number, number]
}

type EnvironmentProps = SkyProps & SceneProps;

// Component Definitions
const skyComponentDefinition = createComponentDefinition<SkyProps, Sky>(
    "Sky",
    () => new Sky(getStaticNullApplication().scene),
    (sky: Sky) => sky.resetSkyMesh(),
);

const sceneComponentDefinition = createComponentDefinition<SceneProps, Scene>(
    "Scene",
    () => getStaticNullApplication().scene
);

skyComponentDefinition.schema = {
    ...skyComponentDefinition.schema,
    scale: {
        validate: (value: unknown) => Array.isArray(value) 
            && value.length === 3 
            && value.every(v => typeof v === 'number'),
        errorMsg: (value: unknown) => `Expected an array of 3 numbers, got \`${typeof value}\``,
        default: [100, 100, 100],
    },
    rotation: {
        validate: (value: unknown) => Array.isArray(value) 
            && value.length === 3 
            && value.every(v => typeof v === 'number'),
        errorMsg: (value: unknown) => `Expected an array of 3 numbers, got \`${typeof value}\``,
        default: [0, 0, 0],
    },
    position: {
        validate: (value: unknown) => Array.isArray(value) 
            && value.length === 3 
            && value.every(v => typeof v === 'number'),
        errorMsg: (value: unknown) => `Expected an array of 3 numbers, got \`${typeof value}\``,
        default: [0, 0, 0],
    },
    center: {
        validate: (value: unknown) => Array.isArray(value) 
            && value.length === 3 
            && value.every(v => typeof v === 'number'),
        errorMsg: (value: unknown) => `Expected an array of 3 numbers, got \`${typeof value}\``,
        default: [0, 0.05, 0],
    }
} as Schema<SkyProps, Sky>;

sceneComponentDefinition.schema = {
    ...sceneComponentDefinition.schema,
    envAtlas: {
        validate: (value: unknown) => value instanceof Asset && value.type === 'texture',
        errorMsg: (value: unknown) => `Expected a \`Asset\` instance, got \`${typeof value}\``,
        default: null,
    },
    skybox: {
        validate: (value: unknown) => value instanceof Asset && value.type === 'texture',
        errorMsg: (value: unknown) => `Expected a \`Asset\` instance, got \`${typeof value}\``,
        default: null,
    },
} as Schema<SceneProps, Scene>;

export { Environment };