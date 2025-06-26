export class SyntheticPointerEvent {

    nativeEvent: PointerEvent;
    hasStoppedPropagation: boolean = false;
    type: string

    constructor(e: PointerEvent) {
        this.nativeEvent = e;
        this.type = e.type;
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
export class SyntheticMouseEvent {

    nativeEvent: MouseEvent;
    hasStoppedPropagation: boolean = false;
    type: string

    constructor(e: MouseEvent) {
        this.nativeEvent = e;
        this.type = e.type;
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

