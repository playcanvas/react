import ReactReconciler from 'react-reconciler';
import * as Scheduler from 'scheduler'; // For scheduling callbacks if needed
import { Application, Entity } from './hosts';

type Props = {
  [key: string]: any;
};

const appConfig = {
    type: 'application',
    createInstance: (type: string, props: Props, rootContainerInstance: any, hostContext: any, internalHandle: any) => {
        return { type, props: { ...props }, children: [] };
    }
}

// Host config object:
// This defines how the reconciler creates, updates, and tears down host instances.
const hostConfig = {
  // The version of React this renderer implements
  version: '0.0.1',

  // Tells React if it should treat text nodes differently:
  supportsMutation: true,

  // Communication with the host environment:
  createInstance(type: string, props: Props, rootContainerInstance: any, hostContext: any, internalHandle: any) {
    console.log('createInstance:', type, props);
    // For example, create a JavaScript object that represents your element:
    // const instance = { type, props: { ...props }, children: [] };
    switch (type) {
        case 'application': return Application.createInstance(type, props, rootContainerInstance, hostContext, internalHandle);
        case 'entity':      return Entity.createInstance(type, props, rootContainerInstance, hostContext, internalHandle);
    }
  },

  createTextInstance(text, rootContainerInstance, hostContext, internalHandle) {
    console.log('createTextInstance:', text);
    // If you need to handle text nodes separately
    // For simplicity, we’ll just store text as a simple object:
    return { type: 'TEXT', text };
  },

  appendInitialChild(parentInstance, child) {
    console.log('appendInitialChild:', parentInstance.type, '->', child.type || child.text);
    parentInstance.children.push(child);
  },

  finalizeInitialChildren(instance, type, props) {
    console.log('finalizeInitialChildren:', type, props);
    // Return true if something needs to be done after initial mount (e.g. focus)
    return false;
  },

  // This is used for setting up a "root" container where your elements live
  createContainerChildSet(container) {
    return [];
  },

  appendChildToContainer(container, child) {
    console.log('appendChildToContainer:', child.type || child.text);
    container.push(child);
  },

  // Likewise, you need to handle removing children, inserting before children, etc.
  // We'll omit a lot of these for brevity, but here’s one for removal:
  removeChildFromContainer(container, child) {
    console.log('removeChildFromContainer:', child.type || child.text);
    const index = container.indexOf(child);
    if (index > -1) {
      container.splice(index, 1);
    }
  },

  // If you need to handle commit phases:
  prepareUpdate(instance, type, oldProps, newProps) {
    // Determine if an update is needed. Return an object with changes or null if no update.
    if (oldProps !== newProps) {
      console.log('prepareUpdate:', type, { oldProps, newProps });
      return { newProps };
    }
    return null;
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    console.log('commitUpdate:', type, updatePayload);
    instance.props = { ...newProps };
  },

  commitTextUpdate(textInstance, oldText, newText) {
    console.log('commitTextUpdate:', { oldText, newText });
    textInstance.text = newText;
  },

  // Context-related methods if needed (for hierarchical info, like theme)
  getRootHostContext(rootContainerInstance) {
    return rootContainerInstance;
  },
  getChildHostContext(parentHostContext, type, rootContainerInstance) {
    return parentHostContext;
  },

  // Scheduling:
  now: Scheduler.unstable_now,
  scheduleDeferredCallback: Scheduler.unstable_scheduleCallback,
  cancelDeferredCallback: Scheduler.unstable_cancelCallback,
  getPublicInstance(instance) {
    return instance;
  },

  // This can be used to determine how text is handled
  shouldSetTextContent(type, props) {
    return false;
  },

  // This can be used if you have some final steps after DOM is updated
  resetAfterCommit() {
    console.log('resetAfterCommit');
  },
  prepareForCommit() {
    console.log('prepareForCommit');
    return null;
  },

  // If your renderer supports "error boundaries" like fallback UI:
  appendChild(parentInstance, child) {
    console.log('appendChild:', parentInstance.type, '->', child.type || child.text);
    parentInstance.children.push(child);
  },

  removeChild(parentInstance, child) {
    console.log('removeChild:', parentInstance.type, '->', child.type || child.text);
    const index = parentInstance.children.indexOf(child);
    if (index > -1) {
      parentInstance.children.splice(index, 1);
    }
  },

  insertBefore(parentInstance, child, beforeChild) {
    console.log('insertBefore:', parentInstance.type, '->', child.type || child.text, 'before', beforeChild.type || beforeChild.text);
    const index = parentInstance.children.indexOf(beforeChild);
    if (index > -1) {
      parentInstance.children.splice(index, 0, child);
    }
  },

  // Some methods required by the reconciler but not used in this minimal example:
  clearContainer(container) {
    container.length = 0;
  },
};

// Create the reconciler from the host config
const PlayCanvasRenderer = ReactReconciler(hostConfig);

// Helper to render into a "root" (an array in this case)
export function render(element, container) {
  // If we haven’t created a root yet, create one:
  let root = PlayCanvasRenderer.createContainer(container, false, false);

  // Update the root with the new element tree
  PlayCanvasRenderer.updateContainer(element, root, null, () => {
    console.log('Rendered!');
  });
}