type PointerEventProps = Pick<PointerEvent, keyof PointerEvent>;

export interface SyntheticPointerEvent extends PointerEventProps {
    type: string;
}

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

type MouseEventProps = Pick<MouseEvent, keyof MouseEvent>;

export interface SyntheticMouseEvent extends MouseEventProps {
    type: string;
}

export class SyntheticMouseEvent {

    nativeEvent: MouseEvent;
    hasStoppedPropagation: boolean = false;

    constructor(e: MouseEvent) {
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

