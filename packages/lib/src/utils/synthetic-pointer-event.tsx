type PointerEventProps = Pick<PointerEvent, keyof PointerEvent>;

export interface SyntheticPointerEvent extends PointerEventProps {}

export class SyntheticPointerEvent {

    nativeEvent: PointerEvent;
    hasStoppedPropagation: boolean = false;

    constructor(e: PointerEvent) {
        this.nativeEvent = e;
        Object.assign(this, e);
    }

    stopPropagation() {
        this.hasStoppedPropagation = true;
        this.nativeEvent.stopPropagation();
    }
    
    stopImmediatePropagation() {
        this.hasStoppedPropagation = true;
        this.nativeEvent.stopImmediatePropagation();
    }
}
