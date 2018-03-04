//Create a Pixi Application
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

window.onload = function() {
    document.body.appendChild(app.view);
}

function setup() {
    loadSprites();
    app.ticker.add(delta => gameLoop(delta))
}

function loadSprites() {
    TextureCache = PIXI.utils.Texture

}

function gameLoop(delta) {

}