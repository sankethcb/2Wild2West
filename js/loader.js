import { Bump } from './bump.js';
import { pollGamepads, setGamepadConnectionEvents, numPads } from './controllers.js';
import { Cowboy } from './cowboy.js';
export { b, app, AddBullet };

let players = []; //Holds the player objects

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

let controlText;
let menuContainer = new PIXI.Container();
let gameContainer = new PIXI.Container();
let bulletList = [];

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
        .add('bullet', './img/bullet.png')
        .load(onLoadAssets);
}

function onLoadAssets() {
    InitMenu();
    app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {

    state(delta);
}

function play(delta) {
    pollGamepads();

    for (let i = 0; i < players.length; i++) {
        players[i].update(delta);
    }
    for (let i = 0; i < bulletList.length; i++) {
        bulletList[i].move(delta);

    }

}

function menu(delta) {
    controlText.text = "Controllers Connected: " + numPads;
}

function AddBullet(bullet) {
    bulletList.push(bullet);
    gameContainer.addChild(bullet.sprite);
}


function SwitchState() {
    if (state == menu) {
        if (numPads == 0) {
            let warnText = new PIXI.Text('Please connect at least 1 controller to play.');
            warnText.position.set(controlText.x, controlText.y + 50);
            menuContainer.addChild(warnText);
            return;
        }

        InitGame(numPads > 2 ? 2 : numPads);
        app.stage.removeChild(menuContainer);
        app.stage.addChild(gameContainer);
        state = play;

    } else if (state == play) {
        app.stage.removeChild(gameContainer);
        app.stage.addChild(menuContainer);
        state = menu;
    }
}

function InitMenu() {
    //Title Message
    let style = new PIXI.TextStyle({
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

    let titleText = new PIXI.Text("2 Wild 2 West", style);
    titleText.anchor.set(0.5);
    titleText.position.set(renderer.width / 2, 400);
    menuContainer.addChild(titleText);

    //Controller Status
    controlText = new PIXI.Text("Controllers Connected: " + numPads);
    controlText.position.set(100, renderer.height - (renderer.height / 6));
    app.stage.addChild(controlText);
    menuContainer.addChild(controlText);

    //Star Sprite
    let button = new PIXI.Sprite(PIXI.loader.resources["star"].texture);
    button.scale.x = 0.2;
    button.scale.y = 0.2;
    button.x = -button.width / 2;
    button.y = -110;

    //Button Text
    style.fontSize = 50;
    let buttonMessage = new PIXI.Text("Start", style);
    buttonMessage.anchor.set(0.5);

    //Add to container and positioning
    let buttonContainer = new PIXI.Container();
    buttonContainer.addChild(button);
    buttonContainer.addChild(buttonMessage);
    buttonContainer.x = renderer.width / 2;
    buttonContainer.y = 600;

    //Make it interactable
    buttonContainer.interactive = true;
    buttonContainer.buttonMode = true;
    buttonContainer.on('pointerdown', SwitchState);

    menuContainer.addChild(buttonContainer);

    app.stage.addChild(menuContainer);
}

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