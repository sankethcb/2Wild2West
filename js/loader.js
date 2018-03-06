import {Bump} from './bump.js';
import {pollGamepads, setGamepadConnectionEvents} from './controllers.js';
import {Cowboy} from './cowboy.js';
export {b, app};

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
		.add('hat', "./img/hat.png")
		.add('crosshair', './img/crosshair.png')
		.load(onLoadAssets);
}

function onLoadAssets() {
	p1 = new Cowboy(1);
	p2 = new Cowboy(2);

	app.stage.addChild(p1.sprite);
	app.stage.addChild(p2.sprite);
	
	app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
	app.renderer.render(app.stage);
	pollGamepads();
	
	p1.update(delta);
	p2.update(delta);
}