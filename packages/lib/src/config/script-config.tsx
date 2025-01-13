import { Script, ScriptComponent } from "playcanvas";
import { ComponentNode } from "./component-config";

export type ScriptProps = Record<string, unknown> & { script: typeof Script };

export type ScriptNode = {
    type: 'script';
    props: ScriptProps;
    attachedTo: ScriptComponent | null;
    script: typeof Script | null;
    scriptInstance: Script | null;
}

export function createInstance(_type: string, props: ScriptProps) : ScriptNode {
    return {
        type: 'script',
        props: props,
        attachedTo: null,
        script: null,
        scriptInstance: null,
    };
}

export function commitUpdate(instance: ScriptNode, _type: string, _oldProps: ScriptProps, newProps: ScriptProps) {
    const { script, attachedTo } = instance;
    const { script: scriptClass, ...props } = newProps;
    
    // The script class has changed, so we need to create a new instance
    if (scriptClass !== script) {
        if(script && attachedTo) {
            // @ts-ignore
            attachedTo.destroy(script);
        }

        const scriptInstance = attachedTo?.create(scriptClass, {
            properties: { ...props },
            preloading: false,
        });

        // @ts-ignore
        instance.scriptInstance = scriptInstance;
    }

    if (instance.scriptInstance) {
        Object.assign(instance.scriptInstance, props);
    }
}

export function appendChild(parent: ComponentNode, child: ScriptNode) {
    
    const script = parent.attachedTo?.script;
    const { script: scriptClass } = child.props;

    if (!script) {
        throw new Error('Entity does not have a script component');
    }

    if (!scriptClass) {
        throw new Error('Script class is required');
    }

    child.attachedTo = script;
    child.script = scriptClass;

}

export function appendInitialChild(parent: ComponentNode, child: ScriptNode) {
    appendChild(parent, child);
}

export function removeChild(parent: ComponentNode, child: ScriptNode) {
    // @ts-ignore
    parent.attachedTo?.script.destroy(child.script);
    child.script = null;
    child.scriptInstance = null;    
}