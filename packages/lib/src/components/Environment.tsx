import { Scene, Sky, Texture } from "playcanvas";
import { useEffect } from "react";
import { useApp } from "../hooks/use-app.tsx";
import { createComponentDefinition, getStaticNullApplication, Schema, validatePropsWithDefaults, warnOnce } from "../utils/validation.ts";
import { PublicProps } from "../utils/types-utils.ts";
import { Asset } from "playcanvas";

const appUUIDs = new Set<string>();

/**
 * Environment component
 * 
 * @description
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
    const { center, depthWrite, type, ...sceneProps } = props;
    const skyProps = { center, depthWrite, type };

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
    const appUUID = app.root.getGuid();
    const appHasEnvironment = appUUIDs.has(appUUID);
    if (appHasEnvironment) {
        warnOnce(`There are multiple \`<Environment/>\` components in the same app instance. 
            This will cause the environment to be set multiple times.
            Only the first \`<Environment/>\` component will be used.`);
    }
    appUUIDs.add(appUUID);
  
    /**
     * Sets the skybox of the environment.
     */
    useEffect(() => {
        // If the app already has an environment, don't override it
        if (appHasEnvironment) return;
        
        app.scene.skybox = safeSceneProps.skybox?.resource as Texture ?? null;  

        return () => {
            app.scene.skybox = null;
        };
    }, [appUUID, appHasEnvironment, safeSceneProps.skybox?.id]);


    /**
     * Sets the environment lighting.
     */
    useEffect(() => {
        // If the app already has an environment, don't override it
        if (appHasEnvironment) return;

        app.scene.envAtlas = safeSceneProps?.envAtlas?.resource as Texture ?? null;

        return () => {
            app.scene.envAtlas = null;
        };
    }, [appUUID, appHasEnvironment, safeSceneProps.envAtlas?.id]);

    /**
     * Sets the remaining environment settings.
     */
    useEffect(() => {   
        if (appHasEnvironment) return;

        Object.assign(app.scene, safeSceneProps);
        Object.assign(app.scene.sky, safeSkyProps);

        return () => {
            // Here we need to reset the scene and sky to their default values
            app.scene.sky.resetSkyMesh();
        };
    }, [appUUID, appHasEnvironment]);

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
type SkyProps = Partial<PublicProps<Sky>> 
type EnvironmentProps = SkyProps & SceneProps;

// Component Definitions
const skyComponentDefinition = createComponentDefinition<SkyProps, Sky>(
    "Element",
    () => new Sky(getStaticNullApplication().scene),
    (sky: Sky) => sky.resetSkyMesh(),
);

const sceneComponentDefinition = createComponentDefinition<SceneProps, Scene>(
    "Scene",
    () => getStaticNullApplication().scene
);

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