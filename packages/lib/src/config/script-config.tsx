import { Script } from "playcanvas";
import { ComponentNode } from "./component-config";

const toLowerCamelCase = (str: string) => str[0].toLowerCase() + str.slice(1);

// @ts-ignore
const getScriptName = (script: typeof Script) => script.constructor.__name ?? toLowerCamelCase(script.constructor.name);

export type ScriptProps = Record<string, unknown> & { script: typeof Script };

export type ScriptNode = {
    type: 'script';
    props: ScriptProps;
    script: typeof Script | null;
}

export function createInstance(_type: string, props: ScriptProps) : ScriptNode {
    return {
        type: 'script',
        props: props,
        script: null,
    };
}

export function commitUpdate(instance: ScriptNode, _type: string, _oldProps: ScriptProps, newProps: ScriptProps) {
    // console.log('commitUpdate', instance, _type, _oldProps, newProps)
    const { script } = instance;
    const { script: scriptClass, ...props } = newProps;

    // If no script component exists, throw an error
    if (!script) {
        throw new Error('Script component does not exist');
    }

    // If the script does not exist, create it
    const scriptName: string = getScriptName(scriptClass);

    // @ts-ignore
    if (script[scriptName]) {
        // @ts-ignore
        const scriptInstance = script[scriptName];
        Object.assign(scriptInstance, props);
    }

}

export function appendChild(parent: ComponentNode, child: ScriptNode) {

    const script = parent.attachedTo?.script;

    if (!script) {
        throw new Error('Entity does not have a script component');
    }

    const { script: scriptClass, ...props } = child.props;

    const scriptInstance = script.create(scriptClass, {
        properties: { ...props },
        preloading: false,
    })

    // @ts-ignore
    child.script = scriptInstance;
}

export function appendInitialChild(parent: ComponentNode, child: ScriptNode) {
    appendChild(parent, child);
}

export function removeChild(parent: ComponentNode, child: ScriptNode) {
    parent.attachedTo?.script?.destroy(getScriptName(child.script!));
    child.script = null;
}
