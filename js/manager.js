export { startManager, gameLoop, b, AddBullet };
import { Bump } from './bump.js';
import { app } from './loader.js';
import { pollGamepads, setGamepadConnectionEvents, numPads } from './controllers.js';
import { Cowboy } from './cowboy.js';

//Core game variables
let state = menu;
let players = []; //Holds the player objects
let bulletList = []; //Holds the active bullets present in the game
let mapList = []; //Holds the map *sprites*

//UI Variables
let controlText;
let menuContainer = new PIXI.Container();
let gameContainer = new PIXI.Container();

//Bump.js variable
let b = new Bump(PIXI);

//Initializes manager itself
function startManager() {
    setGamepadConnectionEvents();
    app.ticker.add(delta => gameLoop(delta))
    InitMenu();
}

//Wrapper to run the proper loop for the proper game state
function gameLoop(delta) {
    state(delta);
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

//The loop when at the menu
function menu(delta) {
    controlText.text = "Controllers Connected: " + numPads;
}


function SwitchState() {
    if (state == menu) {
        //Don't allow the game to start if there are no gamepads
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

//Start up the main menu with all graphics
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
    titleText.position.set(app.renderer.width / 2, 400);
    menuContainer.addChild(titleText);

    //Controller Status
    controlText = new PIXI.Text("Controllers Connected: " + numPads);
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
    style.fontSize = 50;
    let buttonMessage = new PIXI.Text("Start", style);
    buttonMessage.anchor.set(0.5);

    //Add to container and positioning
    let buttonContainer = new PIXI.Container();
    buttonContainer.addChild(button);
    buttonContainer.addChild(buttonMessage);
    buttonContainer.x = app.renderer.width / 2;
    buttonContainer.y = 600;

    //Make it interactable
    buttonContainer.interactive = true;
    buttonContainer.buttonMode = true;
    buttonContainer.on('pointerdown', SwitchState);

    menuContainer.addChild(buttonContainer);

    app.stage.addChild(menuContainer);
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

//Add a bullet to the bullet list
function AddBullet(bullet) {
    bulletList.push(bullet);
    gameContainer.addChild(bullet.sprite);
}

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
            }
        } else if (bulletList[i].playerNum == 1) {
            if (players[1] != null)
                if (b.hit(players[1].sprite, bulletList[i].sprite)) {
                    RemoveBullet(bulletList[i]);
                    players[1].HP--;
                }
        }
    }




}