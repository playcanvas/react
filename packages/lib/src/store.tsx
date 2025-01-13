// store.ts
import * as pc from 'playcanvas';

export interface PlayCanvasStore {
  app: pc.Application;
  // you might add other stuff, e.g. scene references, input manager, etc.
}

// Potentially store multiple apps keyed by an ID or fiberRoot
const storeMap = new Map<number, PlayCanvasStore>();

export function createStoreForApp(app: pc.Application) {
  return { app };
}

export function registerStore(appId: number, store: PlayCanvasStore) {
  storeMap.set(appId, store);
}

export function getStore(appId: number) {
  return storeMap.get(appId);
}

export function removeStore(appId: number) {
  storeMap.delete(appId);
}