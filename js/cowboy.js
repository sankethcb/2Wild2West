import {gamepads as gp, applyDeadzone} from './controllers.js';
import {b} from './loader.js';
export {Cowboy};

//Variables to modify both players' behavior
let maxSpeed = 8;
let deadzone =  0.15;
let crossRange = 125;

class Cowboy 
{
	constructor(pNum) 
	{
		//this.sprite = sprite;
		this.sprite = new PIXI.Sprite(PIXI.loader.resources["hat"].texture);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.position.x = 50;
		this.sprite.position.y = 30;
		b.addCollisionProperties(this.sprite);
		
		//this.crosshair = crossH;
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
	update(delta)
	{
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
		
		if(this.crosshair.position.x == 0 && this.crosshair.position.y == 0)
		{
			this.crosshair.visible = false;
		}
		else
		{
			this.crosshair.visible = true;	
		}
	}
	
	keepInBounds()
	{
		let x = this.position.x;
		let y = this.position.y;
	}
}