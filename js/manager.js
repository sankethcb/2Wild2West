export { startManager, gameLoop, b, AddBullet };
import { Bump } from './bump.js';
import { app } from './loader.js';
import { pollGamepads, setGamepadConnectionEvents, numPads } from './controllers.js';
import { Cowboy } from './cowboy.js';

//Debug variables
const SKIP_MENU = false; //Skips over the menu whether or not controllers are connected

//Core game variables
let state = menu;
let players = []; //Holds the player objects
let bulletList = []; //Holds the active bullets present in the game
let mapList = []; //Holds the map *sprites*
let deadPlayer;
let bg;

//UI Variables
let menuContainer = new PIXI.Container();
let instructContainer = new PIXI.Container();
let gameContainer = new PIXI.Container();
let goContainer = new PIXI.Container();
let fontStyle = new PIXI.TextStyle({
	fontFamily: "Edmunds",
	fontSize: 100,
	fill: "black",
	stroke: 'white'
});
let titleStyle = new PIXI.TextStyle({
	fontFamily: "Edmunds",
	fontSize: 100,
	fill: "black",
	stroke: 'white',
	strokeThickness: 4,
	dropShadow: true,
	dropShadowColor: "#000000",
	dropShadowBlur: 6,
	dropShadowAngle: Math.PI / 6,
	dropShadowDistance: 4
});
let controlText;

//Bump.js variable
let b = new Bump(PIXI);

//Audio variables
let menuMusic = new Howl({
	src: ['./audio/menuLoop.wav'],
	volume: 0.4,
	loop: true
});

//Initializes manager itself
function startManager() {
	setGamepadConnectionEvents();
	app.ticker.add(delta => gameLoop(delta))

	if (SKIP_MENU) {
		state = play;
		InitGame(2);
		return;
	}
	loadBG();
	InitInstructions(); //Set up containers for the menus
	InitMenu();
}

//Load the tiling background
function loadBG() {
	bg = new PIXI.extras.TilingSprite(PIXI.loader.resources['sand'].texture, app.renderer.width, app.renderer.height);
	app.stage.addChild(bg);
}

//Wrapper to run the proper loop for the proper game state
function gameLoop(delta) {
	state(delta);
}

//The loop when at the menu
function menu(delta) {
	controlText.text = "Controllers Connected: " + numPads;
}

//The loop when at the instructions
function instructions(delta){

}

//The loop when in the play state
function play(delta) {
	pollGamepads();

	for (let i = 0; i < players.length; i++) {
		players[i].update(delta);
	}
	for (let i = 0; i < bulletList.length; i++) {
		bulletList[i].move(delta);

	}
	Collisions();
}



function SwitchState(nextState) {
	switch (nextState) {
		case play:
			//Don't allow the game to start if there are no gamepads
			if (numPads == 0) {
				let warnText = new PIXI.Text('Please connect at least 1 controller to play.', fontStyle);
				warnText.position.set(controlText.x, controlText.y + 50);
				menuContainer.addChild(warnText);
				return;
			}

			menuMusic.stop();
			InitGame(numPads > 2 ? 2 : numPads);
			clearCanvas();
			app.stage.addChild(gameContainer);
			state = play;
			break;
		case menu:
			clearCanvas();
			app.stage.addChild(menuContainer);
			if(!menuMusic.playing())
				menuMusic.play();
			state = menu;
			break;
		case instructions:
			clearCanvas();
			app.stage.addChild(instructContainer);
			state = instructions;
			break;
		case gameover:
			clearCanvas();
			app.stage.addChild(goContainer);
			state = gameover;
			break;
					 }
}

//Clears all containers off the canvas and stops any music
function clearCanvas() {
	app.stage.removeChild(menuContainer);
	app.stage.removeChild(instructContainer);
	app.stage.removeChild(gameContainer);
	app.stage.removeChild(goContainer);
}

//Start up the main menu with all graphics
function InitMenu() {
	//Title Message
	let titleText = new PIXI.Text("2 Wild 2 West", titleStyle);
	titleText.anchor.set(0.5);
	titleText.position.set(app.renderer.width / 2, 200);
	menuContainer.addChild(titleText);

	//Controller Status
	controlText = new PIXI.Text("Controllers Connected: " + numPads, fontStyle);
	controlText.position.set(100, app.renderer.height - (app.renderer.height / 6));
	app.stage.addChild(controlText);
	menuContainer.addChild(controlText);

	//Star Sprite
	let button = new PIXI.Sprite(PIXI.loader.resources["star"].texture);
	button.scale.x = 0.2;
	button.scale.y = 0.2;
	button.x = -button.width / 2;
	button.y = -110;

	//Button Text
	fontStyle.fontSize = 50;
	let buttonMessage = new PIXI.Text("Start", fontStyle);
	buttonMessage.anchor.set(0.5);

	//Add to container and positioning
	let buttonContainer = new PIXI.Container();
	buttonContainer.addChild(button);
	buttonContainer.addChild(buttonMessage);
	buttonContainer.x = app.renderer.width / 2;
	buttonContainer.y = titleText.position.y + 200;

	//Make it interactable
	buttonContainer.interactive = true;
	buttonContainer.buttonMode = true;
	buttonContainer.on('pointerdown', (event) => {
		SwitchState(play);
	});

	//Instruction button
	let tutButton = new PIXI.Text("Instructions", fontStyle);
	tutButton.anchor.set(0.5);
	tutButton.x = app.renderer.width / 2;
	tutButton.y = 600;
	tutButton.interactive=true;
	tutButton.buttonMode=true;
	tutButton.on('pointerdown', (event) => {
		SwitchState(instructions);
	});


	menuContainer.addChild(buttonContainer);
	menuContainer.addChild(tutButton);

	SwitchState(menu); //Switch over to the menu when it loads
}

function InitInstructions(){

	let instructText = new PIXI.Text('Instructions', titleStyle);
	instructText.anchor.set(0.5);
	instructText.position.set(app.renderer.width/2, 100);

	//Variables to line up the instructions
	let bottomMargin = 100;
	let textX = app.renderer.width / 2 - 100;
	let currY = 300;
	let textImgGap = 125;

	//Instructions text and images
	let moveText = new PIXI.Text('Move:', fontStyle);
	moveText.anchor.set(0.5);
	moveText.position.set(textX, currY);
	currY += bottomMargin;

	let moveImg = new PIXI.Sprite(PIXI.loader.resources['lstick'].texture);
	moveImg.anchor.set(0.5);
	moveImg.scale.x = 0.04;
	moveImg.scale.y = 0.04;
	moveImg.x = moveText.position.x + textImgGap;
	moveImg.y = moveText.position.y;

	let aimText = new PIXI.Text('Aim:', fontStyle);
	aimText.anchor.set(0.5);
	aimText.position.set(textX, currY);
	currY += bottomMargin;

	let aimImg = new PIXI.Sprite(PIXI.loader.resources['rstick'].texture);
	aimImg.anchor.set(0.5);
	aimImg.scale.x = 0.04;
	aimImg.scale.y = 0.04;
	aimImg.x = aimText.position.x + textImgGap;
	aimImg.y = aimText.position.y;

	let shootText = new PIXI.Text('Shoot:', fontStyle);
	shootText.anchor.set(0.5);
	shootText.position.set(textX, currY);
	currY += bottomMargin;

	let shootImg = new PIXI.Sprite(PIXI.loader.resources['rt'].texture);
	shootImg.anchor.set(0.5);
	shootImg.scale.x = 1;
	shootImg.scale.y = 1;
	shootImg.x = shootText.position.x + textImgGap;
	shootImg.y = shootText.position.y;
	
	/*
	let reloadText = new PIXI.Text('Reload:', fontStyle);
	reloadText.anchor.set(0.5);
	reloadText.position.set(textX, currY);
	currY += bottomMargin;

	let reloadImg = new PIXI.Sprite(PIXI.loader.resources['x'].texture);
	reloadImg.anchor.set(0.5);
	reloadImg.scale.x = 0.04;
	reloadImg.scale.y = 0.04;
	reloadImg.x = reloadText.position.x + textImgGap;
	reloadImg.y = reloadText.position.y;*/

	//Back to menu button
	let backButton= new PIXI.Text("Back to Menu", fontStyle);
	backButton.anchor.set(0.5);
	backButton.x = app.renderer.width / 2;
	backButton.y = 800;
	backButton.interactive=true;
	backButton.buttonMode=true;
	backButton.on('pointerdown', (event) => {
		SwitchState(menu);
	});

	instructContainer.addChild(instructText);
	instructContainer.addChild(moveText);
	instructContainer.addChild(moveImg);
	instructContainer.addChild(aimText);
	instructContainer.addChild(aimImg);
	instructContainer.addChild(shootText);
	instructContainer.addChild(shootImg);
	//instructContainer.addChild(reloadText);
	//instructContainer.addChild(reloadImg);
	instructContainer.addChild(backButton);
}

//Start up the core game when in the play state
function InitGame(numPlayers) {
	if (numPlayers == 0) {
		return;
	}

	//Init all players
	for (let i = 0; i < numPlayers; i++) {
		players[i] = new Cowboy(i + 1);
		gameContainer.addChild(players[i].sprite);
	}
}

function gameover() {
	let titleText = new PIXI.Text();
	if (deadPlayer == 2)
		titleText = new PIXI.Text("White Hat Wins!", titleStyle);
	if (deadPlayer == 1)
		titleText = new PIXI.Text("Black Hat Wins!", titleStyle);
	titleText.anchor.set(0.5);
	titleText.position.set(app.renderer.width / 2, 400);
	goContainer.addChild(titleText);

	app.stage.addChild(goContainer);
}


//Add a bullet to the bullet list
function AddBullet(bullet) {
	bulletList.push(bullet);
	gameContainer.addChild(bullet.sprite);
}

//Remove bullet from the bullet list
function RemoveBullet(bullet) {
	let index = bulletList.indexOf(bullet);
	if (index != -1) {
		gameContainer.removeChild(bullet.sprite);
		bulletList.splice(index, 1);
		bullet = null;
	}
}


//Game Collisions
function Collisions() {

	if (players[1] != null) {
		//Player - Player intersection
		b.hit(players[0].sprite, players[1].sprite, true);
		b.hit(players[1].sprite, players[0].sprite, true);
		//Player - map intersection
		b.hit(players[1].sprite, mapList, true);
	}
	//Player - map intersection
	b.hit(players[0].sprite, mapList, true);




	//Player  - bullet collisions
	for (var i = 0; i < bulletList.length; i++) {
		if (bulletList[i].playerNum == 2) {
			if (b.hit(players[0].sprite, bulletList[i].sprite)) {
				RemoveBullet(bulletList[i]);
				players[0].HP--;
				if (players[0].HP-- == 0) {
					deadPlayer = 1;
					SwitchState(gameover);
				}
			}
		} else if (bulletList[i].playerNum == 1) {
			if (players[1] != null)
				if (b.hit(players[1].sprite, bulletList[i].sprite)) {
					RemoveBullet(bulletList[i]);
					players[1].HP--;
					if (players[1].HP-- == 0) {
						deadPlayer = 2;
						SwitchState(gameover);
					}
				}
		}
	}
}