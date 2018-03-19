import { gamepads as gp, applyDeadzone } from './controllers.js';
import { bullet } from './bullet.js';
import { app } from './loader.js';
import { b, AddBullet } from './manager.js';
export { Cowboy };

//Variables to modify both players' behavior
let maxSpeed = 8;
let deadzone = 0.15;
let crossRange = 125;
let animationFPS = 30;

class Cowboy {
	constructor(pNum) {
		//Sprite settings
		this.sprite = new PIXI.Sprite(PIXI.loader.resources["hat"].texture);
		this.HP = 3;
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.position.x = 50;
		this.sprite.position.y = 30;
		b.addCollisionProperties(this.sprite);

		//Set up crosshair sprite
		this.crosshair = new PIXI.Sprite(PIXI.loader.resources['crosshair'].texture);
		this.crosshair.anchor.set(0.5, 0.5);
		this.sprite.addChild(this.crosshair);

		this.playerNum = pNum;
		this.gamepad = gp[pNum - 1];

		//Movement vars
		this.velocity = {};
		this.velocity.x = 0;
		this.velocity.y = 0;

		this.fwd = {}; //The direction the player is currently pointed towards
		this.fwd.x = 0;
		this.fwd.y = 0;

		//Shooting vars
		this.lastTriggerState = 0; //Last state of the trigger used to shoot

		//Animation vars
		this.lastDirection = 'S';
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
		if (this.gamepad.buttons[7].value > 0.3 && this.lastTriggerState < 0.3) {
			this.shoot();
		}
		this.lastTriggerState = this.gamepad.buttons[7].value;

		this.animate(); //Update sprite texture

		this.keepInBounds();
	}

	animate(){
		//Find what direction the left stick is in
		let currDirection = '';
		let horizontalAxis = '';
		let verticalAxis = '';

		if(applyDeadzone(this.gamepad.axes[1], deadzone) > 0){
			verticalAxis = 'S';
		}
		else{
			verticalAxis = 'N';
		}

		if(applyDeadzone(this.gamepad.axes[0], deadzone) > 0){
			horizontalAxis = 'E';
		}
		else{
			horizontalAxis = 'W';
		}

		currDirection = verticalAxis + horizontalAxis;

		if(currDirection == ''){
			//change sprite to last direction
		}
		else{
			//change sprite to current direction
		}
			



	}

	shoot() {

		let bulletFwd = {};
		bulletFwd.x = applyDeadzone(this.gamepad.axes[2], deadzone);
		bulletFwd.y = applyDeadzone(this.gamepad.axes[3], deadzone);
		let bulletClone = new bullet(this, bulletFwd);

		AddBullet(bulletClone);
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
}