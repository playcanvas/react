import { Mat4, Vec3 } from 'playcanvas';

import { ExtendedQuat } from './math.ts';
import { CubicSpline } from './spline.ts';
import { Pose } from './pose.ts';

const q = new ExtendedQuat();

export type AnimationTrack = {
    /* The name of the track */
    name: string,
    /* The duration of the track */
    duration: number,
    /* The frame rate of the track */
    frameRate: number,
    /* The target of the track */
    target: string,
    /* The loop mode of the track */
    loopMode: 'none' | 'repeat' | 'pingpong',
    /* The interpolation of the track */
    interpolation: 'spline',
    /* The keyframes of the track */
    keyframes: {
        times: number[],
        values: {
            position: number[],
            target: number[]
        }
    }
}

// track an animation cursor with support for looping and ping-pong modes
class AnimCursor {
    duration = 0;

    loopMode = 'none';

    timer = 0;

    cursor = 0;

    constructor(duration = 0, loopMode = 'none') {
        this.reset(duration, loopMode);
    }

    // update(deltaTime) {
    //     // update animation timer
    //     this.timer += deltaTime;

    //     // update the track cursor
    //     this.cursor += deltaTime;

    //     if (this.cursor >= this.duration) {
    //         switch (this.loopMode) {
    //             case 'none': this.cursor = this.duration; break;
    //             case 'repeat': this.cursor %= this.duration; break;
    //             case 'pingpong': this.cursor %= (this.duration * 2); break;
    //         }
    //     }
    // }

    reset(duration = 0, loopMode = 'none') {
        this.duration = duration;
        this.loopMode = loopMode;
        this.timer = 0;
        this.cursor = 0;
    }

    set value(value) {
        if (value < this.duration) {
            this.cursor = value;
        } else {
            switch (this.loopMode) {
                case 'none': this.cursor = this.duration; break;
                case 'repeat': this.cursor %= this.duration; break;
                case 'pingpong': this.cursor %= (this.duration * 2); break;
            }
        }
    }

    get value() {
        return this.cursor;// > this.duration ? this.duration - this.cursor : this.cursor;
    }
}

// Manage the state of a camera animation track
class AnimCamera {

    time = 0;
    spline;

    cursor: AnimCursor = new AnimCursor();

    frameRate: number;

    result: number[] = [];

    position: Vec3 = new Vec3();

    target = new Vec3();

    rotateSpeed = 0.2;

    rotation = new Vec3();

    constructor(spline: CubicSpline, duration: number, loopMode: 'none' | 'repeat' | 'pingpong', frameRate: number) {
        this.time = 0
        this.spline = spline;
        this.cursor.reset(duration, loopMode);
        this.frameRate = frameRate;

        // initialize the camera to the start frame
        this.update();
    }

    update() {
        const { cursor, result, spline, frameRate, position, target } = this;

        // evaluate the spline
        spline.evaluate(cursor.value * frameRate, result);

        if (result.every(isFinite)) {
            position.set(result[0], result[1], result[2]);
            target.set(result[3], result[4], result[5]);
        }

        // // rotate
        // if (input?.rotate) {
        //     if (input.rotate.events.indexOf('up') !== -1) {
        //         // reset on up event`
        //         rotation.set(0, 0, 0);
        //     } else {
        //         rotation.x = Math.max(-90, Math.min(90, rotation.x - input.rotate.value[1] * rotateSpeed));
        //         rotation.y = Math.max(-180, Math.min(180, rotation.y - input.rotate.value[0] * rotateSpeed));
        //     }
        // }
    }

    getPose(pose: Pose) {
        const { position, target, rotation } = this;

        pose.fromLookAt(position, target);

        q.setFromAxisAngle(Vec3.RIGHT, rotation.x);
        pose.rotation.mul2(pose.rotation, q);

        q.setFromAxisAngle(Vec3.UP, rotation.y);
        pose.rotation.mul2(q, pose.rotation);
    }

    // construct an animation from a settings track
    static fromTrack(track: AnimationTrack) {

        const { keyframes, duration, frameRate, loopMode } = track;
        const { times, values } = keyframes;
        const { position, target } = values;

        // construct the points array containing position and target
        const points = [];
        for (let i = 0; i < times.length; i++) {
            points.push(position[i * 3], position[i * 3 + 1], position[i * 3 + 2]);
            points.push(target[i * 3], target[i * 3 + 1], target[i * 3 + 2]);
        }

        const extra = (duration === times[times.length - 1] / frameRate) ? 1 : 0;

        const spline = CubicSpline.fromPointsLooping((duration + extra) * frameRate, times, points, -1);

        return new AnimCamera(spline, duration, loopMode, frameRate);
    }
    
}

type RotationTrackProps = {
    /**
     * The number of keys to generate
     */
    keys?: number,
    /**
     * The duration of the track
     */
    duration?: number,
}

export const createRotationTrack = (initial: Pose, options: RotationTrackProps = { keys: 12, duration: 20 }) => {
    const { keys = 12, duration = 20 } = options;

    const times = new Array(keys).fill(0).map((_, i) => i / keys * duration);
    const position = [];
    const target = [];

    const initialTarget = new Vec3();
    initial.calcTarget(initialTarget);

    const mat = new Mat4();
    const vec = new Vec3();
    const dif = new Vec3(
        initial.position.x - initialTarget.x,
        initial.position.y - initialTarget.y,
        initial.position.z - initialTarget.z
    );

    for (let i = 0; i < keys; ++i) {
        mat.setFromEulerAngles(0, -i / keys * 360, 0);
        mat.transformPoint(dif, vec);

        position.push(initialTarget.x + vec.x);
        position.push(initialTarget.y + vec.y);
        position.push(initialTarget.z + vec.z);

        target.push(initialTarget.x);
        target.push(initialTarget.y);
        target.push(initialTarget.z);
    }

    // construct a simple rotation animation around an object
    return AnimCamera.fromTrack({
        name: 'rotate',
        duration,
        frameRate: 1,
        target: 'camera',
        loopMode: 'repeat',
        interpolation: 'spline',
        keyframes: {
            times,
            values: {
                position,
                target
            }
        }
    });
    
    
}

export { AnimCamera };