import { Application, BoundingBox,  GSplatComponent, Vec3 } from 'playcanvas';

import { lerp, MyQuat } from './math.ts';

const v = new Vec3();

// stores a camera pose
class Pose {

    position: Vec3 = new Vec3();
    rotation: MyQuat = new MyQuat();
    distance: number = 1;

    constructor(other = null) {
        if (other) {
            this.copy(other);
        }
    }

    copy(pose: Pose) {
        this.position.copy(pose.position);
        this.rotation.copy(pose.rotation);
        this.distance = pose.distance;
        return this;
    }

    lerp(a: Pose, b: Pose, t: number) {
        this.position.lerp(a.position, b.position, t);
        this.rotation.lerp(a.rotation, b.rotation, t);
        this.distance = lerp(a.distance, b.distance, t);
        return this;
    }

    fromLookAt(position: Vec3, target: Vec3) {
        this.position.copy(position);
        this.rotation.fromLookAt(position, target);
        this.distance = position.distance(target);
        return this;
    }

    calcTarget(target: Vec3) {
        this.rotation.transformVector(Vec3.FORWARD, v);
        target.copy(v).mulScalar(this.distance).add(this.position);
    }
}

export type PoseType = {
    position: [number, number, number],
    target: [number, number, number]
}

const computeStartingPose = (app: Application, fov: number) : PoseType => {

    const gsplat = app.root.findComponent('gsplat') as unknown as GSplatComponent;

    if (!gsplat) {
        throw new Error("GSplat not found");
    }

    const bbox = gsplat?.instance?.meshInstance?.aabb ?? new BoundingBox();
    const sceneSize = bbox.halfExtents.length() * 1.5;
    const distance = sceneSize / Math.sin(fov / 180 * Math.PI * 0.5);

    const position = new Vec3(2, 1, 2).normalize().mulScalar(distance).add(bbox.center).toArray();
    const target = bbox.center.toArray();

    return {
        position,
        target
    } as PoseType;
}

export { Pose, computeStartingPose };
