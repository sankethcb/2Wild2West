//Create a Pixi Application
import { Bump } from './bump.js';
import{gamepads, pollGamepads, setGamepadConnectionEvents} from './controllers.js';


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

window.onload = function() {
    app.renderer.backgroundColor = 0xd3cb81;
	setGamepadConnectionEvents();
    document.body.appendChild(app.view);
    setup();
}

function setup() {
    loadSprites();
    app.ticker.add(delta => gameLoop(delta))
}

function loadSprites() {

    // TextureCache = PIXI.utils.Texture

    let circle = new PIXI.Graphics();
    circle.beginFill(0x00000);
    circle.drawCircle(0, 0, 50);
    circle.endFill();
    circle.x = app.width / 2;
    circle.y = app.height / 2;
    app.stage.addChild(circle);

}

function gameLoop(delta) {
	pollGamepads();
}