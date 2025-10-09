import { BoxGeometry, Mesh, MeshInstance as PcMeshInstance, StandardMaterial } from "playcanvas";
import { createComponentDefinition, getStaticNullApplication, validatePropsPartial } from "../utils/validation.ts";
import { PublicProps } from "../utils/types-utils.ts";
import { FC, useEffect } from "react";
import { useMeshInstanceRegistration } from "./Render.tsx";


export const MeshInstance: FC<MeshInstanceProps> = (props) => {
    const safeProps = validatePropsPartial(props, componentDefinition);
    const { mesh, material } = safeProps;
    const register = useMeshInstanceRegistration();

    useEffect(() => {
        if (!mesh || !material || !register) return;
        const meshInstance = new PcMeshInstance(mesh, material);
        register(meshInstance);
    }, [mesh, material, register]);

    return null;
}

type MeshInstanceProps = Partial<PublicProps<PcMeshInstance>>;

const componentDefinition = createComponentDefinition<MeshInstanceProps, PcMeshInstance>(
    "MeshInstance",
    () => {
        const app = getStaticNullApplication();
        const box = Mesh.fromGeometry(app.graphicsDevice, new BoxGeometry());
        const material = new StandardMaterial();
        const meshInstance = new PcMeshInstance(box, material);
        return meshInstance;
    },
    (meshInstance) => (meshInstance as PcMeshInstance).destroy(),
    "MeshInstance"   
)

export default MeshInstance;