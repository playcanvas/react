import * as pc from 'playcanvas';
import { HostConfig } from 'react-reconciler';

import entityConfig, { EntityProps } from './config/entity-config';
import * as componentConfig from './config/component-config';
import * as scriptConfig from './config/script-config';

// import type { ReadonlyKeysOf } from 'type-fest';

// Add these types near the top of the file
// type Vec3Arr = [number, number, number];

// type EntityProps = {
//   name?: string;
//   position?: Vec3Arr;
//   rotation?: Vec3Arr;
//   scale?: Vec3Arr;
// };

type EntityNode = {
  type: 'entity';
  entity: pc.Entity;
}

// type SystemKeys = ReadonlyKeysOf<pc.ComponentSystemRegistry>;

// type ComponentNode = {
//   type: 'component';
//   componentType: SystemKeys;
//   componentData: Record<string, any>;
//   componentProps: Record<string, any>;
//   attachedTo: pc.Entity | null;
// }

type PlayCanvasNode = EntityNode | componentConfig.ComponentNode | scriptConfig.ScriptNode;

const hosts: Record<string, any> = {
  entity: entityConfig,
  component: componentConfig,
  // script: scriptConfig,
}

// const entityConfig = {

//   createInstance: (_type: string, props: EntityProps, _app: pc.Application): EntityNode => {
//     const entity = new pc.Entity(props.name);
//     entityConfig.commitUpdate(entity, 'entity', {}, props);
//     return { type: "entity", entity };
//   },

//   commitUpdate(instance: any, _type: string, oldProps: EntityProps, newProps: EntityProps) {
//     console.log('commitUpdate', instance, _type, oldProps, newProps)
//   },
  
//   appendChild: (parent: EntityNode, child: EntityNode) => {
//     if(parent.entity && child.entity) {
//       parent.entity.addChild(child.entity);
//     }
//   },

//   appendInitialChild: (parent: EntityNode, child: EntityNode) => {
//     entityConfig.appendChild(parent, child);
//   }
// }

// type ComponentProps = Record<string, unknown>;

// const componentConfig = {

//   createInstance: (type: SystemKeys, props: ComponentProps, app: pc.Application): ComponentNode => {
          
//     if (!app.systems[type as ComponentType]) {
//       throw new Error(`Invalid component type: '${type}'`);
//     }

//     return {
//       type: 'component',
//       componentType: type,
//       componentData: props,
//       // componentProps: props,
//       attachedTo: null,
//     };

//   },

//   commitUpdate: (instance: ComponentNode, _type: string, _oldProps: ComponentProps, _newProps: ComponentProps) => {
//     // console.log('commitUpdate', instance, _type, oldProps, newProps)

//     const { attachedTo: entity, componentType, componentProps } = instance;


//     if (!entity) {
//       throw new Error('Component is not attached to an entity');
//     }

//     if (!entity[componentType as string]) {
//       entity.addComponent(componentType, { ...componentProps });
//     } 
//     // If component exists, update it
//     const comp = entity[componentType as string];

//     // If the component is a script, we need to create it
//     if(componentType === 'script' && componentProps.script) {
//       comp.create(componentProps.script, {
//         properties: { ...componentProps },
//         preloading: false,
//       })
//     }
  
//     // Quick assign update
//     Object.assign(comp, componentProps);
  
//   },

//   appendChild: (parent: EntityNode, child: ComponentNode) => {

//     // const { type, componentType, componentData, componentProps } = child;
//     // const { entity } = parent;

//     if (parent.entity && child.type === 'component') {

//       // componentConfig.commitUpdate(child, 'component', {}, child); 
      
//       // // If the component doesn’t exist yet, add it
//       // if (entity[componentType as string] !== undefined) {
//       //   entity.addComponent(componentType, { ...componentData });
//       // } 
//       // // @ts-ignore
//       // const comp = entity[componentType];

//       // // If the component is a script, we need to create it
//       // if(componentType === 'script' && componentProps.script) {
//       //   comp.create(componentProps.script, {
//       //     properties: { ...componentProps },
//       //     preloading: false,
//       //   })
//       // } else {
//       //   Object.assign(comp, componentProps);
//       // }

//       child.attachedTo = parent.entity;
//     }
//   },

//   appendInitialChild: (parent: EntityNode, child: ComponentNode) => {
//     componentConfig.appendChild(parent, child);
//   }
// }

import {
  // ContinuousEventPriority,
  // DiscreteEventPriority,
  DefaultEventPriority
} from 'react-reconciler/constants'

// Types describing what kinds of "host elements" we can have in our React DSL:
export type PlayCanvasHostContext = {
  app: pc.Application;
};


type PlayCanvasTextInstance = never; // We won't handle pure text nodes in PlayCanvas


// Add near the top with other types
// type ComponentType = keyof pc.ComponentSystemRegistry;

/*********************************************************************
 * Helper functions to create or update PC Entities & Components
 *********************************************************************/

/** Create or update a component on a given entity */
// function applyComponent(
//   entity: pc.Entity,
//   componentType: string,
//   componentProps: Record<string, any>
// ) {
//   // If the component doesn’t exist yet, add it
//   // @ts-ignore
//   if (!entity[componentType]) {
//     entity.addComponent(componentType, { ...componentProps });
//   } 
//   // If component exists, update it
//   // @ts-ignore
//   const comp = entity[componentType];

//   // If the component is a script, we need to create it
//   if(componentType === 'script' && componentProps.script) {
//     comp.create(componentProps.script, {
//       properties: { ...componentProps },
//       preloading: false,
//     })
//   } else {
//     Object.assign(comp, componentProps);
//   }
// }

// function removeComponent(entity: pc.Entity, componentType: string) {
//   // @ts-ignore
//   if (entity && entity[componentType]) {
//     // @ts-ignore
//     entity.removeComponent(componentType);
//   }
// }

type UpdatePayload = EntityProps & {
  type: string;
  props: Record<string, any>;
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
  UpdatePayload, // UpdatePayload
  unknown, // ChildSet
  any
> = {

  supportsMutation: true,
  isPrimaryRenderer: false,
  supportsPersistence: false,
  supportsHydration: false,
  warnsIfNotActing: false,
  
  // now: () =>Date.now,

  // @ts-ignore
  resolveUpdatePriority: () => DefaultEventPriority,
  getCurrentUpdatePriority: () => DefaultEventPriority,
  setCurrentUpdatePriority: () => DefaultEventPriority,
  maySuspendCommit:() => false,
  
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
  prepareScopeUpdate: () => console.log('prepareScopeUpdate'),
  // getInstanceFromScope: () => null,
  
  prepareUpdate: () => console.log('prepareUpdate'),

  getRootHostContext(rootContainerInstance) {
    return { app: rootContainerInstance.app };
  },
  getChildHostContext(parentHostContext, _type, _rootContainerInstance) {
    return parentHostContext;
  },

  getPublicInstance(instance) {
    // The "public instance" is what a parent component would get if it held a ref
    if (instance.type === 'entity') {
      return instance.entity;
    }
    return instance;
  },

  prepareForCommit(_containerInfo) {
    return null;
  },

  resetAfterCommit() {},

  createInstance(type : string, props, { app }) {


    // return hosts[type].createInstance(type, props, app);

    // If the type is not found, use the component host

    // let host;

    switch(type) {
      case 'entity':
        return hosts['entity'].createInstance(type, props, app);
      case 'pcscript':
        return hosts['script'].createInstance(type, props, app);
      default:
        return hosts['component'].createInstance(type, props, app);
    }



    // const host = type === 'entity' ? hosts['entity'] : hosts['component'];
    // return host.createInstance(type, props, app);

    // switch(type) {
    //   case "entity":
    //     return entityConfig.createInstance(type, props, app);
    //   case "script":
    //     return scriptConfig.createInstance(type, props);
    //   default:
    //     return componentConfig.createInstance(type as componentConfig.SystemKeys, props, app);
    // }

    // if (type === "entity") {

    //   // @ts-ignore
    //   return entityConfig.createInstance(type, props, app);
      
    // } else if (type === "script") {

    //   return scriptConfig.createInstance(type, props);

    // } else {

    //   // @ts-ignore
    //   return componentConfig.createInstance(type, props, app);

    // }
  },

  appendInitialChild(parent, child) {
    console.log('appendInitialChild called with:', parent?.type, child?.type);

    // const host = hosts[child.type];
    // host.appendInitialChild(parent, child);

    if (parent.type === 'entity' && child.type === 'entity') {
      // Append child entity to parent entity
      // console.log('appendInitialChild', parent, child)
      entityConfig.appendInitialChild(parent, child);
      
    } else if (parent.type === 'entity' && child.type === 'component') {
      // Attach component to the parent entity
      // console.log('Append Component to Entity', parent, child)
      componentConfig.appendInitialChild(parent, child);
      
      // applyComponent(parent.entity, child.componentType, child.componentData);
      // child.attachedTo = parent.entity;
    } else if (parent.type === 'component' && child.type === 'script'){
      
      scriptConfig.appendInitialChild(parent, child);
      
    } else {

      console.warn(`Cannot attach a ${child.type} directly to a ${parent.type}.`);
      // e.g. attaching entity to a component makes no sense, or component->component
      // In a more advanced scenario, you might handle special rules, but for now we ignore it.
    }
  },

  finalizeInitialChildren() {
    return false;
  },

  insertInContainerBefore(container, child, beforeChild) {
    console.log('insertInContainerBefore', container, child, beforeChild)
    // const scene = (container.getState().scene as unknown as Instance<THREE.Scene>['object']).__r3f
    // if (!child || !beforeChild || !scene) return

    // insertBefore(scene, child, beforeChild)
  },

  insertBefore() {},

  commitUpdate(instance,  type : string, oldProps, newProps) {
    const host = hosts[instance.type];
    console.log('commitUpdate')
    host.commitUpdate(instance, type, oldProps, newProps);
  },

  shouldSetTextContent(/*type, props*/) {
    // We never set text content on a 3D object
    return false;
  },

  appendChild(parent, child) {
    console.log('appendChild', parent, child)
    // const host = hosts[child.type];
    // host.appendChild(parent, child);

    if (parent.type === 'entity' && child.type === 'entity') {
      // Append child entity to parent entity
      // console.log('appendChild', parent, child)
      entityConfig.appendChild(parent, child);
      
    } else if (parent.type === 'entity' && child.type === 'component') {
      // Attach component to the parent entity
      // console.log('Append Component to Entity', parent, child)
      componentConfig.appendChild(parent, child);
      
      // applyComponent(parent.entity, child.componentType, child.componentData);
      // child.attachedTo = parent.entity;
    } else if (parent.type === 'component' && child.type === 'script'){
      scriptConfig.appendChild(parent, child);
    } else {

      console.warn(`Cannot attach a ${child.type} directly to a ${parent.type}.`);
      // e.g. attaching entity to a component makes no sense, or component->component
      // In a more advanced scenario, you might handle special rules, but for now we ignore it.
    }
    

    // if (child.type === 'entity') {
    //   entityConfig.appendChild(parent, child);
    // } else if (child.type === 'component') {
    //   componentConfig.appendChild(parent, child);
    // }
    // if (!parent || !child) {
    //   // console.warn('appendChild: parent or child is null');
    //   return;
    // }
    // if (parent.type === 'entity' && child.type === 'entity') {
    //   // console.log('Adding child entity to parent entity:');
    //   // parent.entity.addChild(child.entity);
    //   entityConfig.appendChild(parent, child);
    // } else if (parent.type === 'entity' && child.type === 'component') {

    //   componentConfig.appendChild(parent, child);
    //   // applyComponent(parent.entity, child.componentType, child.componentData);
    //   // child.attachedTo = parent.entity;
    // }
  },

  appendChildToContainer(container, child) {
    // console.log('appendChildToContainer', container, child)
    // const host = hosts[child.type];
    // host.appendChildToContainer(container, child);

    // if (child.type === 'entity') {
    //   // console.log('Adding child entity to parent entity:');
    //   // parent.entity.addChild(child.entity);
    //   entityConfig.appendChildToContainer(container, child);
    // } else if (child.type === 'component') {

    //   componentConfig.appendChildToContainer(container, child);
    //   // applyComponent(parent.entity, child.componentType, child.componentData);
    //   // child.attachedTo = parent.entity;
    // }

    if (child.type === 'entity') {
      // Append child entity to parent entity
      console.log('appendInitialChild', child)
      entityConfig.appendChildToContainer(container, child);
      
    } else {

      console.warn(`Cannot attach a ${child.type} directly to the root.`);
      // e.g. attaching entity to a component makes no sense, or component->component
      // In a more advanced scenario, you might handle special rules, but for now we ignore it.
    }

    // The container is the "root container": we can assume it’s a { app: pc.Application } object
    // For top-level Entities, you might automatically add them to app.root
    // if (child.type === 'entity') {
    //   container.app.root.addChild(child.entity);
    // } else if (child.type === 'component') {
    //   // If there's no existing entity, we can't attach the component
    //   // Typically you’d want a <Scene> or <Root> wrapper that’s an Entity
    //   console.warn('Cannot attach a component directly to the root. Wrap it in an <Entity>.');
    // }

  },

  removeChild(parent: PlayCanvasNode, child: PlayCanvasNode) {
    console.log('removeChild', parent, child)
    const host = hosts[child.type]
    host.removeChild(parent, child);

    // if (parent.type === 'entity' && child.type === 'entity') {
    //   if (parent.entity.children.includes(child.entity)) {
    //     parent.entity.removeChild(child.entity);
    //   }
    // } else if (parent.type === 'entity' && child.type === 'component' && child.attachedTo) {
    //   // removeComponent(parent.entity, child.componentType);
    //   // child.attachedTo = null;
    // }
  },

  removeChildFromContainer(container: PlayCanvasHostContext, child: PlayCanvasNode) {
    console.log('removeChildFromContainer', container, child)

    const host = hosts[child.type];
    host.removeChildFromContainer(container, child);
    // if (child.type === 'entity') {
    //   // container.app.root.removeChild(child.entity);
    // } else if (child.type === 'component' && child.attachedTo) {
    //   // removeComponent(child.attachedTo, child.componentType);
    //   // child.attachedTo = null;
    // }
  },

  // Not used for this example
  commitTextUpdate() {
    // No text nodes
  },
  clearContainer() {
    // Typically you don’t want to forcibly remove everything from the container
  },

  detachDeletedInstance: (instance) => { 

    console.log('detachDeletedInstance', instance)
   },

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