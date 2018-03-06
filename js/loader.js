import {Bump} from './bump.js';
import {gamepads, pollGamepads, setGamepadConnectionEvents} from './controllers.js';
import {Cowboy} from './cowboy.js';
export {b};

let p1, p2; //The two players

let app = new PIXI.Application({
	width: 256,
	height: 256,
	antialias: true,
	transparent: false,
	resolution: 1
});

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

let b = new Bump(PIXI);
let TextureCache = PIXI.utils.TextureCache
let texture = TextureCache["./img/hat.png"];

window.onload = function() {
	document.body.appendChild(app.view);
	setGamepadConnectionEvents();
	app.renderer.backgroundColor = 0xd3cb81;
	setup();
}

function setup() {
	PIXI.loader
		.add("./img/hat.png")
		.load(loadSprites);
	app.ticker.add(delta => gameLoop(delta))
}

function loadSprites() {

	let hat = new PIXI.Sprite(PIXI.loader.resources["./img/hat.png"].texture);

	p1 = new Cowboy(hat, 1);

	app.stage.addChild(hat);

}

function gameLoop(delta) {
	app.renderer.render(app.stage);
	pollGamepads();
	p1.update(delta);
}