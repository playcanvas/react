import {
    CULLFACE_NONE,
    SEMANTIC_POSITION,
    BlendState,
    DepthState,
    Mat4,
    QuadRender,
    Script,
    createShaderFromCode,
    FUNC_LESSEQUAL,
    BLENDMODE_ONE,
    BLENDMODE_ONE_MINUS_SRC_ALPHA,
    BLENDMODE_SRC_ALPHA,
    BLENDEQUATION_ADD
} from 'playcanvas';

// import { Element, ElementType } from './element';
// import { Serializer } from './serializer';

const vsCode = /*glsl*/ `
    uniform mat4 camera_matrix;
    uniform vec2 camera_params;

    attribute vec2 vertex_position;

    varying vec3 worldFar;

    void main(void) {
        gl_Position = vec4(vertex_position, 0.0, 1.0);

        vec4 v = camera_matrix * vec4(vertex_position * camera_params, -1.0, 1.0);

        worldFar = v.xyz;
    }
`;

const fsCode = /*glsl*/ `
    uniform vec3 camera_position;
    uniform mat4 camera_viewProjection;
    uniform sampler2D blueNoiseTex32;

    varying vec3 worldFar;

    bool intersectPlane(inout float t, vec3 pos, vec3 dir, vec4 plane) {
        float d = dot(dir, plane.xyz);
        if (abs(d) < 1e-06) {
            return false;
        }

        float n = -(dot(pos, plane.xyz) + plane.w) / d;
        if (n < 0.0) {
            return false;
        }

        t = n;

        return true;
    }

    // https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8#1e7c
    float pristineGrid(in vec2 uv, in vec2 ddx, in vec2 ddy, vec2 lineWidth) {
        vec2 uvDeriv = vec2(length(vec2(ddx.x, ddy.x)), length(vec2(ddx.y, ddy.y)));
        bvec2 invertLine = bvec2(lineWidth.x > 0.5, lineWidth.y > 0.5);
        vec2 targetWidth = vec2(
            invertLine.x ? 1.0 - lineWidth.x : lineWidth.x,
            invertLine.y ? 1.0 - lineWidth.y : lineWidth.y
        );
        vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));
        vec2 lineAA = uvDeriv * 1.5;
        vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
        gridUV.x = invertLine.x ? gridUV.x : 1.0 - gridUV.x;
        gridUV.y = invertLine.y ? gridUV.y : 1.0 - gridUV.y;
        vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);

        grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);
        grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
        grid2.x = invertLine.x ? 1.0 - grid2.x : grid2.x;
        grid2.y = invertLine.y ? 1.0 - grid2.y : grid2.y;

        return mix(grid2.x, 1.0, grid2.y);
    }

    float calcDepth(vec3 p) {
        vec4 v = camera_viewProjection * vec4(p, 1.0);
        return (v.z / v.w) * 0.5 + 0.5;
    }

    bool writeDepth(float alpha) {
        vec2 uv = fract(gl_FragCoord.xy / 32.0);
        float noise = texture2DLodEXT(blueNoiseTex32, uv, 0.0).y;
        return alpha > noise;
    }

    void main(void) {
        vec3 p = camera_position;
        vec3 v = normalize(worldFar - camera_position);

        // intersect ray with the world xz plane
        float t;
        if (!intersectPlane(t, p, v, vec4(0, 1, 0, 0))) {
            discard;
        }

        // calculate grid intersection
        vec3 pos = p + v * t;
        vec2 ddx = dFdx(pos.xz);
        vec2 ddy = dFdy(pos.xz);

        float epsilon = 1.0 / 255.0;

        // calculate fade
        float fade = 1.0 - smoothstep(400.0, 1000.0, length(pos - camera_position));
        if (fade < epsilon) {
            discard;
        }

        vec3 levelPos;
        float levelSize;
        float levelAlpha;

        // 10m grid with colored main axes
        levelPos = pos * 0.1;
        levelSize = 2.0 / 1000.0;
        levelAlpha = pristineGrid(levelPos.xz, ddx * 0.1, ddy * 0.1, vec2(levelSize)) * fade;
        if (levelAlpha > epsilon) {
            vec3 color;
            vec2 loc = max(vec2(0.0), abs(levelPos.xz) - abs(ddx * 0.1) - abs(ddy * 0.1));
            if (loc.x < levelSize) {
                if (loc.y < levelSize) {
                    color = vec3(1.0);
                } else {
                    color = vec3(0.2, 0.2, 1.0);
                }
            } else if (loc.y < levelSize) {
                color = vec3(1.0, 0.2, 0.2);
            } else {
                color = vec3(0.9);
            }
            gl_FragColor = vec4(color, levelAlpha);
            gl_FragDepth = writeDepth(levelAlpha) ? calcDepth(pos) : 1.0;
            return;
        }

        // 1m grid
        levelPos = pos;
        levelSize = 1.0 / 100.0;
        levelAlpha = pristineGrid(levelPos.xz, ddx, ddy, vec2(levelSize)) * fade;
        if (levelAlpha > epsilon) {
            gl_FragColor = vec4(vec3(0.7), levelAlpha);
            gl_FragDepth = writeDepth(levelAlpha) ? calcDepth(pos) : 1.0;
            return;
        }

        // 0.1m grid
        levelPos = pos * 10.0;
        levelSize = 1.0 / 100.0;
        levelAlpha = pristineGrid(levelPos.xz, ddx * 10.0, ddy * 10.0, vec2(levelSize)) * fade;
        if (levelAlpha > epsilon) {
            gl_FragColor = vec4(vec3(0.7), levelAlpha);
            gl_FragDepth = writeDepth(levelAlpha) ? calcDepth(pos) : 1.0;
            return;
        }

        discard;
    }
`;

const calcHalfSize = (fov, aspect, fovIsHorizontal) => {
    let x, y;
    if (fovIsHorizontal) {
        x = Math.tan(fov * Math.PI / 360);
        y = x / aspect;
    } else {
        y = Math.tan(fov * Math.PI / 360);
        x = y * aspect;
    }
    return [ x, y ];
};

const attributes = {
    vertex_position: SEMANTIC_POSITION
};

class InfiniteGrid {
    // shader;
    // quadRender;
    // blendState = new BlendState(false);
    // depthState = new DepthState(FUNC_LESSEQUAL, true);

    visible = true;

    /**
     * @param {AppBase} app - The Application instance
     * @param {string} layerName - The name of the layer to render into
     */
    constructor(app, layerName = 'World') {
        this.app = app;
        this.layerName = layerName;

        this.device = this.app.graphicsDevice;
        const shader = createShaderFromCode(this.device, vsCode, fsCode, 'infinite-grid', attributes);

        this.quadRender = new QuadRender(shader);
        this.cameraMatrixId = this.device.scope.resolve('camera_matrix');
        this.cameraParamsId = this.device.scope.resolve('camera_params');
        this.cameraPositionId = this.device.scope.resolve('camera_position');
        this.cameraViewProjectionId = this.device.scope.resolve('camera_viewProjection');
    
        this.blendState = new BlendState(
            true,
            BLENDEQUATION_ADD, BLENDMODE_SRC_ALPHA, BLENDMODE_ONE_MINUS_SRC_ALPHA,
            BLENDEQUATION_ADD, BLENDMODE_ONE, BLENDMODE_ONE_MINUS_SRC_ALPHA
        );
    }

    set camera(entity) {
        
        const camera = entity?.camera;
        if(!entity || !camera || this._camera === entity ) return;

        this._camera = entity;        

        camera.onPreRenderLayer = (layer, transparent) => {
            if (this.visible && layer.name === this.layerName && !transparent) {
                this.device.setBlendState(this.blendState);
                this.device.setCullMode(CULLFACE_NONE);
                this.device.setDepthState(DepthState.NODEPTH);
                this.device.setStencilState(null, null);                

                // update viewProjectionInverse matrix
                const cameraMatrix = this._camera.getWorldTransform().clone();
                const cameraParams = calcHalfSize(camera.fov, camera.aspectRatio, camera.horizontalFov);
                const cameraPosition = cameraMatrix.getTranslation();
                const cameraViewProjection = new Mat4().mul2(camera.projectionMatrix, camera.viewMatrix);

                this.cameraMatrixId.setValue(cameraMatrix.data);
                this.cameraParamsId.setValue(cameraParams);
                this.cameraPositionId.setValue([cameraPosition.x, cameraPosition.y, cameraPosition.z]);
                this.cameraViewProjectionId.setValue(cameraViewProjection.data);
 
                this.quadRender.render();
            }
        };
    }

    get camera() {
        return this._camera;
    }

    destroy() {
        const camera = this._camera?.camera
        if(camera?.onPreRenderLayer) camera.onPreRenderLayer = null;
    }
}

/**
 * The {@link https://api.playcanvas.com/classes/Engine.Script.html | Script} class is
 * the base class for all PlayCanvas scripts. Learn more about writing scripts in the
 * {@link https://developer.playcanvas.com/user-manual/scripting/ | scripting guide}.
 */
export class Grid extends Script {
    /**
     * Called when the script is about to run for the first time.
     */
    initialize() {
        this.grid = new InfiniteGrid(this.app);
        this.on('destroy', _ => this.grid.destroy())
    }

    update(){
        const camera = this.app.root.findOne(node => node.camera)
        this.grid.camera = camera;
    }
}