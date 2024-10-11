const tmpVa = new Vec2();
    const tmpV1 = new Vec3();
    const tmpV2 = new Vec3();
    const tmpR1 = new Ray();
    const tmpP1 = new Plane();

    const PASSIVE = { passive: false };

    const LOOK_MAX_ANGLE = 90;

    function calcEntityAABB(bbox, entity) {
        bbox.center.set(0, 0, 0);
        bbox.halfExtents.set(0, 0, 0);
        entity.findComponents('render').forEach((render) => {
            render.meshInstances.forEach((mi) => {
                bbox.add(mi.aabb);
            });
        });
        return bbox;
    }

    class BaseCamera {
        /**
         * @type {Entity}
         */
        entity;

        /**
         * @type {HTMLElement}
         */
        target = document.documentElement;

        /**
         * @type {number}
         */
        sceneSize = 100;

        /**
         * @type {number}
         */
        lookSensitivity = 0.2;

        /**
         * @type {number}
         */
        lookDamping = 0.97;

        /**
         * @type {number}
         */
        moveDamping = 0.98;

        /**
         * @type {Entity}
         * @protected
         */
        _camera = null;

        /**
         * @type {Vec3}
         * @protected
         */
        _origin = new Vec3(0, 1, 0);

        /**
         * @type {Vec3}
         * @protected
         */
        _position = new Vec3();

        /**
         * @type {Vec2}
         * @protected
         */
        _dir = new Vec2();

        /**
         * @type {Vec3}
         * @protected
         */
        _angles = new Vec3();

        /**
         * @param {Entity} entity - The entity to attach the camera to.
         * @param {HTMLElement} target - The target element to listen for pointer events.
         * @param {Record<string, any>} options - The options for the camera.
         */
        constructor(entity, target, options = {}) {
            this.entity = entity;
            this.target = target;
            this.sceneSize = options.sceneSize ?? this.sceneSize;
            this.lookSensitivity = options.lookSensitivity ?? this.lookSensitivity;
            this.lookDamping = options.lookDamping ?? this.lookDamping;
            this.moveDamping = options.moveDamping ?? this.moveDamping;

            this._onPointerDown = this._onPointerDown.bind(this);
            this._onPointerMove = this._onPointerMove.bind(this);
            this._onPointerUp = this._onPointerUp.bind(this);
        }

        /**
         * @param {number} dt - The delta time in seconds.
         * @private
         */
        _smoothLook(dt) {
            const lerpRate = 1 - Math.pow(this.lookDamping, dt * 1000);
            this._angles.x = math.lerp(this._angles.x, this._dir.x, lerpRate);
            this._angles.y = math.lerp(this._angles.y, this._dir.y, lerpRate);
            this.entity.setEulerAngles(this._angles);
        }

        /**
         * @param {number} dt - The delta time in seconds.
         * @private
         */
        _smoothMove(dt) {
            this._position.lerp(this._position, this._origin, 1 - Math.pow(this.moveDamping, dt * 1000));
            this.entity.setPosition(this._position);
        }

        /**
         * @param {MouseEvent} event - The mouse event.
         * @private
         */
        _onContextMenu(event) {
            event.preventDefault();
        }

        /**
         * @param {PointerEvent} event - The pointer event.
         * @protected
         * @abstract
         */
        _onPointerDown(event) {}

        /**
         * @param {PointerEvent} event - The pointer move event.
         * @protected
         * @abstract
         */
        _onPointerMove(event) {}

        /**
         * @param {PointerEvent} event - The pointer event.
         * @protected
         * @abstract
         */
        _onPointerUp(event) {}

        /**
         * @param {PointerEvent} event - The pointer move event.
         * @protected
         */
        _look(event) {
            if (event.target !== this.target) {
                return;
            }
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            this._dir.x = math.clamp(this._dir.x - movementY * this.lookSensitivity, -LOOK_MAX_ANGLE, LOOK_MAX_ANGLE);
            this._dir.y -= movementX * this.lookSensitivity;
        }

        /**
         * @param {Entity} camera - The camera entity to attach.
         */
        attach(camera) {
            this._camera = camera;
            this._camera.setLocalEulerAngles(0, 0, 0);

            window.addEventListener('pointerdown', this._onPointerDown);
            window.addEventListener('pointermove', this._onPointerMove);
            window.addEventListener('pointerup', this._onPointerUp);
            window.addEventListener('contextmenu', this._onContextMenu);

            this.entity.addChild(camera);
        }

        detach() {
            window.removeEventListener('pointermove', this._onPointerMove);
            window.removeEventListener('pointerdown', this._onPointerDown);
            window.removeEventListener('pointerup', this._onPointerUp);
            window.removeEventListener('contextmenu', this._onContextMenu);

            this.entity.removeChild(this._camera);
            this._camera = null;

            this._dir.x = this._angles.x;
            this._dir.y = this._angles.y;

            this._origin.copy(this._position);
        }

        /**
         * @param {number} dt - The delta time in seconds.
         */
        update(dt) {
            if (!this._camera) {
                return;
            }

            this._smoothLook(dt);
            this._smoothMove(dt);
        }
    }