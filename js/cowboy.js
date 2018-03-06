import {gamepads as gp, applyDeadzone} from './controllers.js';
import {b} from './loader.js';
export {Cowboy};

//Variables to modify both players behavior
let maxSpeed = 8;
//let deadzone = 

class Cowboy 
{
	constructor(sprite, pNum) 
	{
		this.sprite = sprite;
		b.addCollisionProperties(sprite);

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
	update(delta)
	{
		this.fwd.x = applyDeadzone(this.gamepad.axes[0], 0.10);
		this.fwd.y = applyDeadzone(this.gamepad.axes[1], 0.10);;

		this.velocity.x = this.fwd.x * maxSpeed;
		this.velocity.y = this.fwd.y * maxSpeed;
		
		this.sprite.position.x += this.velocity.x * delta;
		this.sprite.position.y += this.velocity.y * delta;

	}
}