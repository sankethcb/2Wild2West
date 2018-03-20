import { gamepads as gp, applyDeadzone } from './controllers.js';
import { bullet } from './bullet.js';
import { app } from './loader.js';
import { b, AddBullet } from './manager.js';
export { Cowboy };

//Variables to modify both players' behavior
let maxSpeed = 8;
let deadzone = 0.15;
let crossRange = 125;
let animationFPS = 15;
let p1Spawn = [50, 300];
let p2Spawn = [300, 300];

class Cowboy {
	constructor(pNum) {
		//Sprite settings
		this.sprite = new PIXI.Sprite(PIXI.loader.resources["hat"].texture);
		this.HP = 3;
		this.sprite.anchor.set(0.5, 0.5);
		b.addCollisionProperties(this.sprite);

		//Set up crosshair sprite
		this.crosshair = new PIXI.Sprite(PIXI.loader.resources['crosshair'].texture);
		this.crosshair.anchor.set(0.5, 0.5);
		this.sprite.addChild(this.crosshair);

		//Player number and color
		this.playerNum = pNum;
		this.gamepad = gp[pNum - 1];

		if(this.playerNum == 1){
			this.color = 'white';

			//Set spawn position and direction
			this.sprite.position.x = p1Spawn[0];
			this.sprite.position.y = p1Spawn[1];
			this.lastDirection = 'E';
		}
		else{
			this.color = 'black';

			this.sprite.position.x = p2Spawn[0];
			this.sprite.position.y = p2Spawn[1];
			this.lastDirection = 'W';
		}

		//Movement vars
		this.velocity = {};
		this.velocity.x = 0;
		this.velocity.y = 0;

		this.fwd = {}; //The direction the player is currently pointed towards
		this.fwd.x = 0;
		this.fwd.y = 0;

		//Shooting vars
		this.lastTriggerState = 0; //Last state of the trigger used to shoot
		this.isAiming = false; //Determines if the player is actively aiming the crosshair

		//Animation vars
		this.frameNum = 9; //Frame the animation is on. 9 is the start, 0 is the end.
		this.currFrameTime = 0; //Time this frame has been displaying
		this.isShooting = false; //Is the shoot animation happening?
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
			this.isAiming = false;
		} else {
			this.crosshair.visible = true;
			this.isAiming = true;
		}

		//Shooting
		if (this.gamepad.buttons[7].value > 0.3 && this.lastTriggerState < 0.3 && this.isAiming) {
			this.isShooting = true;
			this.frameNum = 2;
			this.shoot();
		}
		this.lastTriggerState = this.gamepad.buttons[7].value;

		this.animate(delta); //Update sprite texture

		this.keepInBounds();
	}

	animate(delta){
		//Find what direction the desired stick is in
		let currDirection = '';
		let action; //The action the cowboy is doing

		if(this.isShooting){
			action = 'shoot';
			currDirection = this.getCardinalStickDirection(3, 2);
			if(currDirection == '')
				currDirection = this.lastDirection;
		}
		else{
			currDirection = this.getCardinalStickDirection(1, 0);

			if(currDirection == ''){
				action = 'idle';
				this.frameNum = 0;
				currDirection = this.lastDirection;
			}
			else{
				this.lastDirection = currDirection;
				action = 'walk';
			}
		}

		//Set the texture based on the color, direction, action, and frame number
		this.sprite.texture = PIXI.loader.resources[
			this.color + '_' + currDirection + '_' + action + this.frameNum
		].texture;

		this.currFrameTime += delta;

		//Should the next frame cycle in?
		if(this.currFrameTime >= 60/animationFPS){
			if(this.frameNum <= 0){
				this.frameNum = 9; //Reset cycle back to top
				this.isShooting = false; //Reset shooting
			}
			else{
				this.frameNum--;
			}

			this.currFrameTime = 0; //Reset time for next frame
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

	//Gets cardinal direction of one of the player's analog sticks using horizontal and vertical axes
	getCardinalStickDirection(vertical, horizontal){
		let horizontalDir = '';
		let verticalDir = '';

		if(applyDeadzone(this.gamepad.axes[vertical], deadzone) > 0)
			verticalDir = 'S';
		if(applyDeadzone(this.gamepad.axes[vertical], deadzone) < 0)
			verticalDir = 'N';
		if(applyDeadzone(this.gamepad.axes[horizontal], deadzone) > 0)
			horizontalDir = 'E';
		if(applyDeadzone(this.gamepad.axes[horizontal], deadzone) < 0)
			horizontalDir = 'W';

		return verticalDir + horizontalDir;
	}

}