//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
//Add the canvas that Pixi automatically created for you to the HTML document
window.onload=function(){
    document.body.appendChild(app.view);
}
