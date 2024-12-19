import { Entity } from "playcanvas";

interface EntityProps {
    name: string,
}

export default {
    type: 'entity',
    createInstance: (type: string, props: EntityProps, rootContainerInstance: any, hostContext: any, internalHandle: any) => {

        if (type !== 'entity') throw new Error(`Invalid type: "${type}"`);

        const { name = 'Untitled' } = props;
        const entity = new Entity(name);
        return entity;
    }
}