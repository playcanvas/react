import { ReadonlyKeysOf } from "type-fest";
import { EntityNode } from "./entity-config";
import { PlayCanvasHostContext } from "../hostConfig";

export type SystemKeys = Exclude<ReadonlyKeysOf<pc.ComponentSystemRegistry>, 'script'>;
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
    console.log('commitUpdate', instance, _type, _oldProps, newProps)
    const { attachedTo: entity, componentType } = instance;

    if (!entity) {
        throw new Error('Component is not attached to an entity');
    }

    // @ts-ignore
    const comp = entity[componentType as string];
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