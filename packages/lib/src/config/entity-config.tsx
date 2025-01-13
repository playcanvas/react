import { Entity } from "playcanvas";
import { PlayCanvasHostContext } from "../hostConfig";

export type Vec3Arr = [number, number, number];

export type EntityProps = {
  name?: string;
  position?: Vec3Arr;
  rotation?: [number, number, number?];
  scale?: Vec3Arr;
};

export type EntityNode = {
  type: 'entity';
  entity: pc.Entity;
}


function createInstance (_type: string, props: EntityProps, _app: pc.Application): EntityNode {
    const entity = new Entity(props.name);
    const instance : EntityNode = { type: "entity", entity };
    commitUpdate(instance, 'entity', {}, props);
    return instance;
}
  
function commitUpdate(instance: EntityNode, _type: string, oldProps: EntityProps, newProps: EntityProps) {
    console.log('commitUpdate', instance, _type, oldProps, newProps)

    if(newProps.position && Array.isArray(newProps.position)) {
        instance.entity.setLocalPosition(...newProps.position);
    }

    if(newProps.rotation && Array.isArray(newProps.rotation)) {
        instance.entity.setLocalEulerAngles(...newProps.rotation);
    }

    if(newProps.scale && Array.isArray(newProps.scale)) {
        instance.entity.setLocalScale(...newProps.scale);
    }
}
    
function appendChild(parent: EntityNode, child: EntityNode) {
    if (parent.type !== 'entity' ) {
        console.warn('Cannot attach an entity directly to a component. Wrap it in an <Entity>.');
        return;
    }

    if (child.type !== 'entity') {
        console.warn(`Cannot attach an ${child.type} directly to an entity.`);
        return;
    }

    parent.entity.addChild(child.entity);
}

function appendChildToContainer(container: PlayCanvasHostContext, child: EntityNode) {
    container.app.root.addChild(child.entity);
}
  
function appendInitialChild(parent: EntityNode, child: EntityNode) {
    appendChild(parent, child);
}

function removeChild(parent: EntityNode, child: EntityNode) {
    if(parent.entity && child.entity) {
        parent.entity.removeChild(child.entity);
    }
}

function removeChildFromContainer(container: PlayCanvasHostContext, child: EntityNode) {
    container.app.root.removeChild(child.entity);
}

export default {
    name,
    createInstance,
    commitUpdate,
    appendChild,
    appendInitialChild,
    removeChild,
    removeChildFromContainer,
    appendChildToContainer,
}