import { startManager, gameLoop } from './manager.js';
export { app };

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

let TextureCache = PIXI.utils.TextureCache
let renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

window.onload = function() {
    document.body.appendChild(app.view);
    app.renderer.backgroundColor = 0xd3cb81;
    setup();
}


function setup() {
    PIXI.loader
        .add('hat', "./img/hat.png")
        .add('crosshair', './img/crosshair.png')
        .add('star', './img/star.png')
        .add('bullet', './img/bullet.png')
        .load(startManager);
}