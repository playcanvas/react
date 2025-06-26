import { AppBase, CameraComponent, Entity, GraphNode, Picker } from "playcanvas"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { SyntheticMouseEvent, SyntheticPointerEvent } from "./synthetic-event.ts";

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


const getEntityAtPointerEvent = async (app : AppBase, picker: Picker, rect: DOMRect, e : MouseEvent) : Promise<Entity | null> => {
    // Find the highest priority camera
    const [activeCamera] : CameraComponent[] = (app.root.findComponents('camera') as CameraComponent[])
        .filter((camera: CameraComponent) => !camera.renderTarget)
        .sort((a: CameraComponent, b: CameraComponent) => a.priority - b.priority);

    if (!activeCamera) return null;

     // Get canvas bounds
     const canvas = app.graphicsDevice.canvas;

     if(!canvas || canvas.width === 0 || canvas.height === 0) return null;
     
     // Calculate position relative to canvas
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     
     // Scale calculation using PlayCanvas's DPR
     const scaleX = canvas.width / (rect.width * app.graphicsDevice.maxPixelRatio);
     const scaleY = canvas.height / (rect.height * app.graphicsDevice.maxPixelRatio);
 
     // prepare the picker and perform picking
     try {
        picker.prepare(activeCamera, app.scene);
        const [meshInstance] = await picker.getSelectionAsync(
            x * scaleX,
            y * scaleY
        );
        if (!meshInstance) return null
    
        return meshInstance?.node as Entity;
    } catch {
        // The picker can fail if the camera is not active or the canvas is not visible
        return null;
    }

}

export const usePicker = (app: AppBase | null, el: HTMLElement | null, pointerEvents: Set<string>) => {
    const activeEntity = useRef<Entity | null>(null);
    const pointerDetails = useRef<PointerEvent | null>(null);
    const canvasRectRef = useRef<DOMRect | null>(app ? app.graphicsDevice.canvas.getBoundingClientRect() : null);

    // Construct a Global Picker
    const picker: Picker | null = useMemo((): Picker | null => {
        if (!app || !app.graphicsDevice) return null;
        return new Picker(app, app.graphicsDevice.width, app.graphicsDevice.height);
    }, [app]);

    // Watch for the canvas to resize. Neccesary for correct picking
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            canvasRectRef.current = app ? app.graphicsDevice.canvas.getBoundingClientRect() : null;
            if(canvasRectRef.current) {
                picker?.resize(canvasRectRef.current.width, canvasRectRef.current.height);
            }
        });

        if(app?.graphicsDevice?.canvas) resizeObserver.observe(app.graphicsDevice.canvas);
        return () => resizeObserver.disconnect();

    }, [app]);


    // Store pointer position
    const onPointerMove = useCallback((e: PointerEvent) => {
        pointerDetails.current = e;
    }, [picker])

    const onFrameUpdate = useCallback(async () => {
        if (pointerEvents.size === 0) return;

        const e : PointerEvent | null = pointerDetails.current;
        if (!picker || !app || !e) return null;

        if (!canvasRectRef.current) return null;

        const entity = await getEntityAtPointerEvent(app, picker, canvasRectRef.current, e);
        // if (!entity) return null;

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

    }, [picker, pointerEvents] );

    // Construct a generic handler for pointer events
    const onInteractionEvent = useCallback(async (e: MouseEvent)  => {
        if (!picker || !app || !canvasRectRef.current) return;

        const entity = await getEntityAtPointerEvent(app, picker, canvasRectRef.current, e);

        if (!entity) return

        // Handle other pointer events (down, up, move)
        const syntheticEvent = e instanceof PointerEvent
            ? new SyntheticPointerEvent(e)
            : new SyntheticMouseEvent(e);

        propagateEvent(entity, syntheticEvent);

    }, [picker, pointerEvents] );

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
    }, [app, el, onInteractionEvent, pointerEvents]);
}