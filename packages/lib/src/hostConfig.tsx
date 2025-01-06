import * as pc from 'playcanvas';
import { HostConfig } from 'react-reconciler';

import {
  // ContinuousEventPriority,
  // DiscreteEventPriority,
  DefaultEventPriority,
} from 'react-reconciler/constants'

// Types describing what kinds of "host elements" we can have in our React DSL:
type PlayCanvasHostContext = {
  app: pc.Application;
};

// type EventPriority = number
// let currentUpdatePriority: EventPriority = DefaultEventPriority

// const NO_CONTEXT: HostConfig['hostContext'] = {}

type PlayCanvasNode =
  | {
      type: 'pcentity' | 'abc' | 'test';
      entity: pc.Entity;
    }
  | {
      type: 'component';
      componentType: string; // e.g. 'model', 'camera', 'light'
      componentData: Record<string, any>;
      attachedTo: pc.Entity | null;
    };

type PlayCanvasTextInstance = never; // We won't handle pure text nodes in PlayCanvas

/*********************************************************************
 * Helper functions to create or update PC Entities & Components
 *********************************************************************/

/** Create a new PlayCanvas Entity */
// function createPlayCanvasEntity(props: Record<string, any>): pc.Entity {
//   const entity = new pc.Entity(props.name || 'UnnamedEntity'+Math.random());

//   // You might do additional default setup here:
//   // if (props.position) {
//   //   entity.setPosition(props.position.x, props.position.y, props.position.z);
//   // }
//   // if (props.rotation) {
//   //   entity.setEulerAngles(props.rotation.x, props.rotation.y, props.rotation.z);
//   // }
//   // ...and so forth for scale or other top-level entity props

//   return entity;
// }

/** Create or update a component on a given entity */
function applyComponent(
  entity: pc.Entity,
  componentType: string,
  componentProps: Record<string, any>
) {
  // If the component doesn’t exist yet, add it
  // @ts-ignore
  if (!entity[componentType]) {
    entity.addComponent(componentType, componentProps);
  } else {
    // If component exists, update it
    // @ts-ignore
    const comp = entity[componentType];
    Object.assign(comp, componentProps);
  }
}

function removeComponent(entity: pc.Entity, componentType: string) {
  // @ts-ignore
  if (entity && entity[componentType]) {
    // @ts-ignore
    entity.removeComponent(componentType);
  }
}

/*********************************************************************
 * The HostConfig for react-reconciler
 *********************************************************************/
export const ReactPlayCanvasHostConfig: HostConfig<
  string,              // Type
  Record<string, any>, // Props
  PlayCanvasHostContext,
  PlayCanvasNode,
  PlayCanvasTextInstance,
  unknown, // SuspenseInstance
  PlayCanvasNode,
  pc.Entity | PlayCanvasNode, // Change from pc.Entity | null to PlayCanvasNode
  unknown, // PublicInstance
  unknown, // HostContext
  unknown, // UpdatePayload
  unknown, // ChildSet
  any
> = {

  supportsMutation: true,
  isPrimaryRenderer: false,

  // @ts-ignore
  resolveUpdatePriority: (...args: any[]) => {
    // console.log('resolveUpdatePriority', args)
    return DefaultEventPriority;
  },
  // @ts-ignore
  getCurrentUpdatePriority(...args: any[]) {
    // console.log('getCurrentUpdatePriority', args)
    return DefaultEventPriority;
  },
  // @ts-ignore
  setCurrentUpdatePriority(...args: any[]) {
    // console.log('setCurrentUpdatePriority', args)
    return DefaultEventPriority
  },
  maySuspendCommit() {
    return false
  },
  // // @ts-ignore
  // supportsMutation: function (...args: any[]) {
  //   console.log("createInstance", ...args);
  //   return true;
  // },
  // // isPrimaryRenderer: false,
  // warnsIfNotActing: false,
  // // @ts-ignore
  // supportsMutation: _ => true,
  // supportsPersistence: false,
  // supportsHydration: true,
  // createContainerChildSet: () => { throw new Error('Persistence not supported') },
  // appendChildToContainerChildSet: () => { throw new Error('Persistence not supported') },
  // finalizeContainerChildren: () => { throw new Error('Persistence not supported') },
  // replaceContainerChildren: () => { throw new Error('Persistence not supported') },
  // cloneInstance: () => { throw new Error('Persistence not supported') },
  // createTextInstance: () => { throw new Error('Text not supported') },
  // preparePortalMount: () => { /* noop */ },
  // scheduleTimeout: setTimeout,
  // cancelTimeout: clearTimeout,
  // getCurrentEventPriority: () => 99,
  // getInstanceFromNode: () => null,
  // beforeActiveInstanceBlur: () => { /* noop */ },
  // afterActiveInstanceBlur: () => { /* noop */ },
  // prepareScopeUpdate: () => { /* noop */ },
  // getInstanceFromScope: () => null,
  

  // now: Date.now,
  getRootHostContext(rootContainerInstance) {
    // console.log('getRootHostContext', rootContainerInstance.app)
    return { app: rootContainerInstance.app };
  },
  getChildHostContext(parentHostContext, _type, _rootContainerInstance) {
    // console.log('getChildHostContext', parentHostContext, _type, _rootContainerInstance)
    // return null
    return parentHostContext;
  },

  getPublicInstance(instance) {
    console.log('getPublicInstance', instance)
    // The "public instance" is what a parent component would get if it held a ref
    if (instance.type === 'pcentity') {
      return instance.entity;
    }
    return instance;
  },

  prepareForCommit(/*rootContainerInstance*/) {
    console.log('prepareForCommit')
    // Noop
    return null;
  },
  resetAfterCommit(rootContainerInstance) {
    console.log('resetAfterCommit', rootContainerInstance)
    // Often you’d do a re-render or update tick to let PC know things changed.
    // For example:
    // rootContainerInstance.app.render();
  },

  createInstance(type, props/*, rootContainerInstance, hostContext, internalHandle*/) {
    if (type === "test") {
      console.log("createInstance test", props);
      const entity = new pc.Entity(props.name || "Unnamed");
      return { type: "test", entity };
    } else if (type === "abc") {
      console.log("createInstance abc", props);
      const entity = new pc.Entity(props.name || "Unnamed");
      return { type: "abc", entity };
    } else {
      console.log('createInstance', type, props)
      // We assume everything else is a component
      // e.g. "model", "camera", "light", "rigidbody", "collision", etc.
      return {
        type: 'component',
        componentType: type.toLowerCase(),
        componentData: props,
        attachedTo: null,
      };
    }
    // if (type.toLowerCase() === 'abc' || type.toLowerCase() === 'test') {
    //   // Create a new entity node
    //   const entity = createPlayCanvasEntity(props);
    //   console.log('createInstance', type, props, entity)
    //   return {
    //     type: 'pcentity',
    //     entity,
    //   };
    // } else {
    //   console.log('createInstance', type, props)
    //   // We assume everything else is a component
    //   // e.g. "model", "camera", "light", "rigidbody", "collision", etc.
    //   return {
    //     type: 'component',
    //     componentType: type.toLowerCase(),
    //     componentData: props,
    //     attachedTo: null,
    //   };
    // }
  },

  appendInitialChild(parent, child) {
    console.log('appendInitialChild called with:', parent?.type, child?.type);
    if (!parent || !child) {
        console.warn('appendInitialChild: parent or child is null');
        return;
    }
    if (parent.type === 'pcentity' && child.type === 'pcentity') {
      // Append child entity to parent entity
      console.log('appendInitialChild', parent, child)
      parent.entity.addChild(child.entity);
    } else if (parent.type === 'pcentity' && child.type === 'component') {
      // Attach component to the parent entity
      applyComponent(parent.entity, child.componentType, child.componentData);
      child.attachedTo = parent.entity;
    } else {
      // e.g. attaching entity to a component makes no sense, or component->component
      // In a more advanced scenario, you might handle special rules, but for now we ignore it.
    }
  },

  finalizeInitialChildren(/*instance, type, props, rootContainerInstance, hostContext*/) {
    console.log('finalizeInitialChildren')
    // Return whether we need an extra commit phase pass; typically false
    return false;
  },

  insertInContainerBefore(container, child, beforeChild) {
    console.log('insertInContainerBefore', container, child, beforeChild)
    // const scene = (container.getState().scene as unknown as Instance<THREE.Scene>['object']).__r3f
    // if (!child || !beforeChild || !scene) return

    // insertBefore(scene, child, beforeChild)
  },

  insertBefore(container, child, beforeChild) {
    console.log('insertBefore', container, child, beforeChild)
  },

  prepareUpdate(_instance, _type, oldProps, newProps/*, rootContainerInstance, hostContext*/) {
    console.log('prepareUpdate', _instance, _type, oldProps, newProps)
    // If we need to do a re-render for changed props, we can return an UpdatePayload.
    // We’ll just return something truthy if there's a difference.
    const propKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    for (let key of propKeys) {
      if (oldProps[key] !== newProps[key]) {
        // Just returning a boolean is enough to tell React we have something to update.
        return true;
      }
    }
    return true;
  },

  commitUpdate(instance, _type, _oldProps, newProps/*, internalHandle*/) {
    console.log('commitUpdate', instance, _type, _oldProps, newProps)
    if (instance.type === 'pcentity') {
      // Update entity properties (position, rotation, name, etc.)
      // @ts-ignore
      if (oldProps.name !== newProps.name) {
        instance.entity.name = newProps.name || 'UnnamedEntity';
      }
      if (newProps.position) {
        instance.entity.setPosition(
          newProps.position.x,
          newProps.position.y,
          newProps.position.z
        );
      }
      if (newProps.rotation) {
        instance.entity.setEulerAngles(
          newProps.rotation.x,
          newProps.rotation.y,
          newProps.rotation.z
        );
      }
      // ...and so on for other entity-level props
    } else if (instance.type === 'component' && instance.attachedTo) {
      // Update the component on the attached entity
      applyComponent(instance.attachedTo, instance.componentType, newProps);
      instance.componentData = newProps;
    }
  },

  shouldSetTextContent(/*type, props*/) {
    // We never set text content on a 3D object
    return false;
  },

  appendChild(parent, child) {
    console.log('appendChild called with:', parent?.type, child?.type);
    if (!parent || !child) {
        console.warn('appendChild: parent or child is null');
        return;
    }
    if (parent.type === 'pcentity' && child.type === 'pcentity') {
      parent.entity.addChild(child.entity);
    } else if (parent.type === 'pcentity' && child.type === 'component') {
      applyComponent(parent.entity, child.componentType, child.componentData);
      child.attachedTo = parent.entity;
    }
  },

  appendChildToContainer(container, child) {
    // The container is the "root container": we can assume it’s a { app: pc.Application } object
    // For top-level Entities, you might automatically add them to app.root
    console.log('appendChildToContainer', container, child)
    if (child.type === 'pcentity') {
      container.app.root.addChild(child.entity);
    } else if (child.type === 'component') {
      // If there's no existing entity, we can't attach the component
      // Typically you’d want a <Scene> or <Root> wrapper that’s an Entity
      console.warn('Cannot attach a component directly to the root. Wrap it in an <Entity>.');
    }
  },

  removeChild(parent: PlayCanvasNode, child: PlayCanvasNode) {
    console.log('removeChild', parent, child)
    if (parent.type === 'pcentity' && child.type === 'pcentity') {
      if (parent.entity.children.includes(child.entity)) {
        parent.entity.removeChild(child.entity);
      }
    } else if (parent.type === 'pcentity' && child.type === 'component' && child.attachedTo) {
      removeComponent(parent.entity, child.componentType);
      child.attachedTo = null;
    }
  },

  removeChildFromContainer(container: PlayCanvasHostContext, child: PlayCanvasNode) {
    console.log('removeChildFromContainer', container, child)
    if (child.type === 'pcentity') {
      container.app.root.removeChild(child.entity);
    } else if (child.type === 'component' && child.attachedTo) {
      removeComponent(child.attachedTo, child.componentType);
      child.attachedTo = null;
    }
  },

  // Not used for this example
  commitTextUpdate() {
    // No text nodes
  },
  clearContainer() {
    // Typically you don’t want to forcibly remove everything from the container
  },

  // detachDeletedInstance: () => { /* noop */ },

  // @ts-ignore 
  // setCurrentUpdatePriority(newPriority: EventPriority) {
  //   currentUpdatePriority = newPriority
  // },
  // // @ts-ignore
  // getCurrentUpdatePriority() {
  //   return currentUpdatePriority
  // },
  // resolveUpdatePriority() {
  //   // if (currentUpdatePriority !== NoEventPriority) return currentUpdatePriority

  //   switch (typeof window !== 'undefined' && window.event?.type) {
  //     case 'click':
  //     case 'contextmenu':
  //     case 'dblclick':
  //     case 'pointercancel':
  //     case 'pointerdown':
  //     case 'pointerup':
  //       return DiscreteEventPriority
  //     case 'pointermove':
  //     case 'pointerout':
  //     case 'pointerover':
  //     case 'pointerenter':
  //     case 'pointerleave':
  //     case 'wheel':
  //       return ContinuousEventPriority
  //     default:
  //       return DefaultEventPriority
  //   }
  // },
  // @ts-ignore
  // resolveUpdatePriority: (...args) => {
  //   console.log('resolveUpdatePriority', args)
  //   return DefaultEventPriority;
  // },
  // // @ts-ignore
  // getCurrentUpdatePriority(...args) {
  //   console.log('getCurrentUpdatePriority', args)
  //   return DefaultEventPriority;
  // },
  // // @ts-ignore
  // setCurrentUpdatePriority(...args) {
  //   console.log('setCurrentUpdatePriority', args)
  //   return DefaultEventPriority
  // },
};