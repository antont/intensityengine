
/*
 *=============================================================================

 * Copyright (C) 2008 Alon Zakai ('Kripken') kripkensteiner@gmail.com
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


Library.include('library/' + Global.LIBRARY_VERSION + '/Events');

WorldAreas = {
    plugins: {
        Core: {
            shouldAct: true,

            clientActivate: function() {
                this.worldArea = {
                    colliding: false,
                    action: null,
                };
            },

            clientOnCollision: function(entity) {
                if (entity !== getPlayerEntity()) return;

                this.worldArea.collidingDelay = 0.5; // Must be at least the span between collision checks!

                if (!this.worldArea.action) {
                    this.worldArea.action = new WorldAreas.InputCaptureAction();
                    this.queueAction(this.worldArea.action);
                }
            },
        },

/* TODO: Make WorldNotices a plugin here
        Notice: {
            clientActivate: function() {
                this.worldArea.notice = {
                    text
                };
            },
        },
*/
    },

    Action: Action.extend({
        doExecute: function(seconds) {
            this.actor.worldArea.collidingDelay -= seconds; // When collisions occur they refresh this
            var ret = this.actor.worldArea.collidingDelay <= 0;
            if (!ret) {
                this.actor.emit('worldAreaActive')
            }
            return ret;
        },

        doFinish: function() {
            this._super();

            this.actor.worldArea.action = null;
        },
    }),
};

WorldAreas.InputCaptureAction = WorldAreas.Action.extend(InputCaptureActionPlugin).extend({
    doStart: function() {
        this.clientClick = permanentBind(this.actor.clientClick, this.actor);
        this.actionKey = permanentBind(this.actor.actionKey, this.actor);

        this._super();
    },
});

