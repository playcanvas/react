import { ReadonlyKeysOf } from "type-fest";
import { EntityNode } from "./entity-config";
import { PlayCanvasHostContext } from "../hostConfig";


type SystemKeys = ReadonlyKeysOf<pc.ComponentSystemRegistry>;
type ComponentProps = Record<string, unknown>;

export type ComponentNode = {
  type: 'component';
  componentType: SystemKeys;
  componentData: Record<string, any>;
  componentProps: Record<string, any>;
  attachedTo: pc.Entity | null;
}

export function createInstance(type: SystemKeys, props: ComponentProps, app: pc.Application): ComponentNode {
            
    if (!app.systems[type as SystemKeys]) {
        throw new Error(`Invalid component type: '${type}'`);
    }

    return {
        type: 'component',
        componentType: type,
        componentData: props,
        componentProps: props,
        attachedTo: null,
    };
  
}
  
export function commitUpdate(instance: ComponentNode, _type: string, _oldProps: ComponentProps, newProps: ComponentProps) {
    // console.log('commitUpdate', instance, _type, oldProps, newProps)

    const { attachedTo: entity, componentType, componentProps } = instance;

    if (!entity) {
        throw new Error('Component is not attached to an entity');
    }

    // if (!entity[componentType as string]) {
    //     entity.addComponent(componentType, { ...componentProps });
    // } 

    // @ts-ignore
    const comp = entity[componentType as string];

    // If the component is a script, we need to create it
    if(componentType === 'script' && componentProps.script) {
        const { script, ...props } = newProps
        comp.create(script, {
            properties: props,//{ ...componentProps },
            preloading: false,
        })

        const scriptInstance = comp[script]
        Object.assign(scriptInstance, props)
        console.log('script', scriptInstance)
    } else {
        Object.assign(comp, newProps);
    }

    // Quick assign update
    Object.assign(comp, newProps);

}
  
export function appendChild(parent: EntityNode, child: ComponentNode) {

    if (parent.type === 'entity' && child.type === 'component') {

        // @ts-ignore
        if (!parent.entity[child.componentType as string]) {
            parent.entity.addComponent(child.componentType, { ...child.componentProps });
        } 

        child.attachedTo = parent.entity;
        commitUpdate(child, 'component', {}, child.componentProps); 
    }
}


export function appendInitialChild(parent: EntityNode, child: ComponentNode) {
    appendChild(parent, child);
}

export function removeChild(parent: EntityNode, child: ComponentNode) {
    parent.entity.removeComponent(child.componentType);
    child.attachedTo = null;
}

// export function removeChildFromContainer(container: PlayCanvasHostContext, child: ComponentNode) {
    
// }

export function appendChildToContainer(_container: PlayCanvasHostContext, _child: ComponentNode) {
    console.warn('Cannot attach a component directly to the root. Wrap it in an <Entity>.');
}