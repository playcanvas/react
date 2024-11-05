import { AppBase, CameraComponent, Entity, GraphNode, Picker } from "playcanvas"
import { useCallback, useLayoutEffect, useMemo, useRef } from "react"
import { SyntheticMouseEvent, SyntheticPointerEvent } from "./synthetic-event";

// Utility to propagate events up the entity hierarchy
const propagateEvent = (entity: Entity, event: SyntheticPointerEvent | SyntheticMouseEvent, stopAt: Entity | null = null): boolean => {
    while (entity) {
        if(entity === stopAt) return false;
        entity.fire(event.type, event);
        if (event.hasStoppedPropagation) return true;
        entity = entity.parent as Entity;
    }
    return false;
};

const getNearestCommonAncestor = (a: GraphNode | null, b: GraphNode | null): GraphNode | null => {
    const ancestors = new Set<GraphNode>();

    // Traverse up the parent chain of entity 'a' and add each ancestor to the set
    let current: GraphNode | null = a;
    while (current) {
        ancestors.add(current);
        current = current.parent;
    }

    // Traverse up the parent chain of entity 'b' and check against the set
    current = b;
    while (current) {
        if (ancestors.has(current)) {
            return current; // Found the nearest common ancestor
        }
        current = current.parent;
    }

    return null; // No common ancestor found
};


const getEntityAtPointerEvent = async (app : AppBase, picker: Picker, e : MouseEvent) : Promise<Entity | null> => {
    // Find the highest priority camera
    const [activeCamera] : CameraComponent[] = (app.root.findComponents('camera') as CameraComponent[])
        .filter((camera: CameraComponent) => !camera.renderTarget)
        .sort((a: CameraComponent, b: CameraComponent) => a.priority - b.priority);

    if (!activeCamera) return null;

    // prepare the picker and perform picking
    picker.prepare(activeCamera, app.scene);
    const [meshInstance] = await picker.getSelectionAsync(e.clientX, e.clientY);

    if (!meshInstance) return null

    return meshInstance?.node as Entity;
}

export const usePicker = (app: AppBase | null, el: HTMLElement | null) => {
    const activeEntity = useRef<Entity | null>(null);
    const pointerDetails = useRef<PointerEvent | null>(null);

    // Construct a Global Picker
    const picker: Picker | null = useMemo((): Picker | null => {
        if (!app || !app.graphicsDevice) return null;
        return new Picker(app, app.graphicsDevice.width, app.graphicsDevice.height);
    }, [app]);

    // Store pointer position
    const onPointerMove = useCallback((e: PointerEvent) => {
        pointerDetails.current = e;
    }, [picker])

    const onFrameUpdate = useCallback(async () => {

        const e : PointerEvent | null = pointerDetails.current;
        if (!picker || !app || !e) return null;

        const entity = await getEntityAtPointerEvent(app, picker, e);
        if (!entity) return null;

        const prevEntity = activeEntity.current;

        // Find the common ancestor of the current target and last event. We do not need to bubble past this
        const stopBubblingAt : Entity | null = getNearestCommonAncestor(prevEntity, entity) as Entity;

        // If the pointer moves out of the current hovered entity (and its children)
        if (prevEntity && prevEntity !== entity) {
            const pointerOutEvent = new SyntheticPointerEvent(e);
            pointerOutEvent.type = 'pointerout';
            propagateEvent(prevEntity, pointerOutEvent, stopBubblingAt);
        }

        // If the pointer moves over a new entity
        if (entity && entity !== prevEntity) {
            const pointerOverEvent = new SyntheticPointerEvent(e);
            pointerOverEvent.type = 'pointerover';
            propagateEvent(entity, pointerOverEvent, stopBubblingAt);
        }

        // Update our reference
        activeEntity.current = entity;

        return null;

    }, [picker] );

    // Construct a generic handler for pointer events
    const onInteractionEvent = useCallback(async (e: MouseEvent)  => {
        if (!picker || !app) return;

        const entity = await getEntityAtPointerEvent(app, picker, e);

        if (!entity) return

        // Handle other pointer events (down, up, move)
        const syntheticEvent = e instanceof PointerEvent
            ? new SyntheticPointerEvent(e)
            : new SyntheticMouseEvent(e);

        propagateEvent(entity, syntheticEvent);

    }, [picker]);

    useLayoutEffect(() => {
        if (!picker || !el || !app) return;

        el.addEventListener('pointerup', onInteractionEvent);
        el.addEventListener('pointerdown', onInteractionEvent);
        el.addEventListener('mouseup', onInteractionEvent);
        el.addEventListener('click', onInteractionEvent);
        el.addEventListener('pointermove', onPointerMove);
        app.on('update', onFrameUpdate);
        
        return () => {
            el.removeEventListener('pointerup', onInteractionEvent);
            el.removeEventListener('pointerdown', onInteractionEvent);
            el.removeEventListener('click', onInteractionEvent);
            el.removeEventListener('pointermove', onPointerMove);
            app.off('update', onFrameUpdate);
        };
    }, [app, el, onInteractionEvent]);
}