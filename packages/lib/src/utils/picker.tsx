import { AppBase, CameraComponent, Picker } from "playcanvas"
import { useCallback, useLayoutEffect, useMemo } from "react"
import { SyntheticPointerEvent } from "./synthetic-pointer-event";

export const usePicker = (app : AppBase | null, el : HTMLElement | null ) => {

    const picker : Picker | null = useMemo(() : any => {
        if (!app || !app.graphicsDevice) return null;
        return new Picker(app, app.graphicsDevice.width, app.graphicsDevice.height)
    }, [app]);

    const onPointerEvent = useCallback(async (e : PointerEvent) => {
        if (!picker || !app) return;

        const cameraComponents : CameraComponent[] = (app.root.findComponents('camera') as CameraComponent[])
            .filter((camera : CameraComponent) => !camera.renderTarget)
            .sort((a : CameraComponent, b : CameraComponent) => a.priority - b.priority)

        const activeCamera = cameraComponents[0];

        picker.prepare(activeCamera, app.scene);
        const [meshInstance] = await picker.getSelectionAsync(e.clientX, e.clientY);

        let entity = meshInstance.node;

        const pointerEvent = new SyntheticPointerEvent(e);

        while(entity) {
            entity[`__${e.type}`]?.(pointerEvent)
            if (pointerEvent.hasStoppedPropagation) break;
            entity = entity.parent;
        }
    }, [picker])

    useLayoutEffect(() : any => {
        if(!picker || !el) return;
        el.addEventListener('pointerdown', onPointerEvent)
        el.addEventListener('pointerup', onPointerEvent)
        return () => el.removeEventListener('pointerup', onPointerEvent)
    }, [el, onPointerEvent])
}