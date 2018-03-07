import { Bump } from './bump.js';
import { pollGamepads, setGamepadConnectionEvents } from './controllers.js';
import { Cowboy } from './cowboy.js';
export { b, app };

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
let renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
let state = menu;

let style;
let message;
let button;
let buttonMessage;
let buttonContainer = new PIXI.Container();

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
        .add('star', './img/star.png')
        .load(onLoadAssets);
}

function onLoadAssets() {
    p1 = new Cowboy(1);
    p2 = new Cowboy(2)
    InitMenu();
    app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {

    state(delta);
}

function play(delta) {
    app.renderer.render(app.stage);
    pollGamepads();

    p1.update(delta);
    p2.update(delta);
}

function menu(delta) {


}

function SwitchState() {
    if (state == menu) {
        state = play;
        app.stage.removeChild(message);
        app.stage.removeChild(buttonContainer);


        app.stage.addChild(p1.sprite);
        app.stage.addChild(p2.sprite);
    } else if (state == play) {
        state = menu;
        app.stage.addChild(message);
        app.stage.addChild(buttonContainer);


        app.stage.removeChild(p1.sprite);
        app.stage.removeChild(p2.sprite);

    }
}

function InitMenu() {
    //Title Message
    style = new PIXI.TextStyle({
        fontFamily: "Tahoma",
        fontSize: 100,
        fill: "black",
        stroke: 'white',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    });

    message = new PIXI.Text("2 Wild 2 West", style);
    message.anchor.set(0.5);
    message.position.set(renderer.width / 2, 400);
    app.stage.addChild(message);

    //Star Sprite
    button = new PIXI.Sprite(PIXI.loader.resources["star"].texture);
    button.scale.x = 0.2;
    button.scale.y = 0.2;
    button.x = -button.width / 2;
    button.y = -110;

    //Button Text
    style.fontSize = 50;
    buttonMessage = new PIXI.Text("Start", style);
    buttonMessage.anchor.set(0.5);

    //Add to container and positioning
    buttonContainer.addChild(button);
    buttonContainer.addChild(buttonMessage);
    buttonContainer.x = renderer.width / 2;
    buttonContainer.y = 600;

    //Make it interactable
    buttonContainer.interactive = true;
    buttonContainer.buttonMode = true;
    buttonContainer.on('pointerdown', SwitchState);

    app.stage.addChild(buttonContainer);
}