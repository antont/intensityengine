
/*
 *=============================================================================
 * Copyright (C) 2010 Alon Zakai ('Kripken') kripkensteiner@gmail.com
 *
 * This file is part of the Intensity Engine project,
 *    http://www.intensityengine.com
 *
 * The Intensity Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * The Intensity Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with the Intensity Engine.  If not, see
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/licenses/agpl-3.0.html
 *=============================================================================
 */


//! Allows '2D' platform games, i.e., games inherently 2D in gameplay but
//! shown in nice 3D.
Platformer = {
    vector3FromAxis: function(axis) {
        var ret = new Vector3(0, 0, 0);
        if (axis === '+x') {
            ret.x = 1;
        } else if (axis === '-x') {
            ret.x = -1;
        } else if (axis === '+y') {
            ret.y = 1;
        } else {
            ret.y = -1;
        }
        return ret;
    },

    plugin: {
        //! '+x', '-x', '+y' or '-y': the axis on which we move. Always +.
        platformAxis: new StateString({ clientSet: true }),

        //! The position along the fixed axis (the other one, orthogonal to forward)
        platformPosition: new StateString({ clientSet: true }),

        //! The axis for the camera: axis and a distance
        platformCameraAxis: new StateString({ clientSet: true }),

        //! Direction the player is facing, in the platform axis : left or right
        getPlatformDirection: function() {
            return this.xmapDefinedPositionData - 1;
        },

        setPlatformDirection: function(direction) {
            this.xmapDefinedPositionData = direction + 1;
        },

        init: function() {
            this.platformAxis = '+x';
            this.platformPosition = 512;
            this.platformCameraAxis = '+y';

            this.movementSpeed = 75;
        },

        clientActivate: function() {
            this.platformCameraDistance = 150;
            this.lastCameraPosition = null;
            this.platformYaw = -1;
            this.platformFov = 50;
            this.platformMove = 0;
            this.setPlatformDirection(1);
        },

        clientAct: function(seconds) {
            if (this === getPlayerEntity() && !isPlayerEditing(this)) {
                // Affix to the position
                var position = this.position.copy(), velocity = this.velocity.copy();
                if (this.platformAxis[1] == 'x') {
                    if (Math.abs(position.y - this.platformPosition) > 0.5) {
                        position.y = this.platformPosition;
                        velocity.y = 0;
                    } else position = null;
                } else {
                    if (Math.abs(position.x - this.platformPosition) > 0.5) {
                        position.x = this.platformPosition;
                        velocity.x = 0;
                    } else position = null;
                }
                if (position !== null) {
                    this.position = position.lerp(this.position, seconds*5);
                    this.velocity = velocity;
                    log(WARNING, "Fixed platform position " + Global.time);
                }

                var platformAxis = Platformer.vector3FromAxis(this.platformAxis);
                this.platformYaw = normalizeAngle(
                    platformAxis.mul(this.getPlatformDirection()).toYawPitch().yaw,
                    this.yaw
                );
                this.yaw = magnet(lerp(this.yaw, this.platformYaw, 1-seconds*15), this.platformYaw, 45);
                this.pitch = 0;
                this.move = this.platformMove && (Math.abs(this.platformYaw - this.yaw) < 1);

                if (Global.cameraDistance) {
                    this.platformCameraDistance = lerp(this.platformCameraDistance, Global.cameraDistance*3, 1-seconds*5);
                }

                var cameraPosition = platformAxis.mul(-this.platformCameraDistance*0.15);
                if (this.lastCameraPosition === null) this.lastCameraPosition = cameraPosition;
                cameraPosition = this.lastCameraPosition.lerp(cameraPosition, 1-seconds*0.5);
                this.lastCameraPosition = cameraPosition.copy();
                cameraPosition.add(this.position);
                cameraPosition.z += this.radius*3;
                cameraPosition.add(Platformer.vector3FromAxis(this.platformCameraAxis).mul(this.platformCameraDistance));
                var direction = this.position.subNew(cameraPosition);
                orientation = direction.toYawPitch();
                UserInterface.forceCamera(cameraPosition, orientation.yaw, orientation.pitch, 0, this.platformFov);
            }
        },
    },

    performMovement: function(move, down) {
        if (isPlayerEditing(getPlayerEntity())) return this._super.apply(this, arguments);

        this.performJump(move === 1 && down);
    },

    //! Called when the left/right buttons are pressed. By default we do a normal strafe
    //! @param strafe Left or right
    //! @param down If the button press is down or not
    performStrafe: function(strafe, down) {
        if (isPlayerEditing(getPlayerEntity())) return this._super.apply(this, arguments);

        var player = getPlayerEntity();
        if (Platformer.vector3FromAxis(player.platformCameraAxis).crossProduct(Platformer.vector3FromAxis(player.platformAxis)).z < 0)
            strafe = -strafe;

        var old = player.getPlatformDirection(strafe);
        if (strafe !== 0) player.setPlatformDirection(strafe);
        player.platformMove = down;
    },

    mapelements: {
        AxisSwitcher: registerEntityClass(bakePlugins(AreaTrigger, [{
            _class: 'AxisSwitcher',

            platformAxis: new StateString(),
            platformCameraAxis: new StateString(),

            init: function() {
                this.platformAxis = '+x';
                this.platformCameraAxis = '+y';
            },

            clientOnCollision: function(collider) {
                if (collider !== getPlayerEntity()) return;
                if (collider.platformAxis !== this.platformAxis) {
                    collider.platformAxis = this.platformAxis;
                    collider.platformCameraAxis = this.platformCameraAxis;
                    if (this.platformAxis[1] === 'x') {
                        collider.platformPosition = this.position.x;
                    } else {
                        collider.platformPosition = this.position.y;
                    }
                }
            },
        }])),
    },
};

