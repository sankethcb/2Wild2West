import { gamepads as gp, applyDeadzone } from './controllers.js';
import { bullet } from './bullet.js';
import { b, app, AddBullet } from './loader.js';
export { Cowboy };

//Variables to modify both players' behavior
let maxSpeed = 8;
let deadzone = 0.15;
let crossRange = 125;
let lastState = 0;

class Cowboy {
    constructor(pNum) {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources["hat"].texture);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.x = 50;
        this.sprite.position.y = 30;
        b.addCollisionProperties(this.sprite);

        this.crosshair = new PIXI.Sprite(PIXI.loader.resources['crosshair'].texture);
        this.crosshair.anchor.set(0.5, 0.5);

        this.sprite.addChild(this.crosshair);

        this.playerNum = pNum;
        this.gamepad = gp[pNum - 1];

        this.velocity = {};
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.fwd = {};
        this.fwd.x = 0;
        this.fwd.y = 0;
    }

    //Update the cowboy object
    update(delta) {
        if (delta === undefined) {
            return;
        }

        //Movement
        this.fwd.x = applyDeadzone(this.gamepad.axes[0], deadzone);
        this.fwd.y = applyDeadzone(this.gamepad.axes[1], deadzone);

        this.velocity.x = this.fwd.x * maxSpeed;
        this.velocity.y = this.fwd.y * maxSpeed;

        this.sprite.position.x += this.velocity.x * delta;
        this.sprite.position.y += this.velocity.y * delta;

        //Crosshair position
        this.crosshair.position.x = applyDeadzone(this.gamepad.axes[2], deadzone) * crossRange;

        this.crosshair.position.y = applyDeadzone(this.gamepad.axes[3], deadzone) * crossRange;

        if (this.crosshair.position.x == 0 && this.crosshair.position.y == 0) {
            this.crosshair.visible = false;
        } else {
            this.crosshair.visible = true;
        }

        //Shooting
        if (this.gamepad.buttons[7].value > 0.3 && lastState < 0.3) {
            this.shoot();
        }
        lastState = this.gamepad.buttons[7].value;
        this.keepInBounds();
    }

    //Keeps the cowboy in bounds
    keepInBounds() {
        let x = this.sprite.position.x;
        let y = this.sprite.position.y;
        let spriteHalfWidth = this.sprite.width / 2;
        let spriteHalfHeight = this.sprite.height / 2;
        let stageWidth = app.renderer.width;
        let stageHeight = app.renderer.height;

        if (x - spriteHalfWidth <= 0)
            this.sprite.position.x = spriteHalfWidth;

        if (x + spriteHalfWidth >= stageWidth)
            this.sprite.position.x = stageWidth - spriteHalfWidth;

        //Add the same padding that the other bounds have
        if (y + spriteHalfHeight >= stageHeight - 10)
            this.sprite.position.y = stageHeight - spriteHalfHeight - 10;

        if (y - spriteHalfHeight <= 0)
            this.sprite.position.y = spriteHalfHeight;
    }

    shoot() {

        let bulletFwd = {};
        bulletFwd.x = applyDeadzone(this.gamepad.axes[2], deadzone);
        bulletFwd.y = applyDeadzone(this.gamepad.axes[3], deadzone);
        let bulletClone = new bullet(this, bulletFwd);

        AddBullet(bulletClone);
    }
}