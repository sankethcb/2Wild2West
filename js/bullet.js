export { bullet };

class bullet {
    constructor(cowboy, bf) {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources["bullet"].texture);
        this.sprite.anchor.set(0.5, 0.5);
        this.fwd = bf;

        this.velocity = {};
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.speed = 10;

        this.normalize(this.fwd);
        this.sprite.position = cowboy.sprite.position;
        this.sprite.position.x += cowboy.sprite.width / 2 * this.fwd.x;
        this.sprite.position.y += cowboy.sprite.height / 2 * this.fwd.y;
        console.log(this.sprite.position);
        this.rotateSprite();

    }

    move(delta) {
        this.velocity.x = this.fwd.x * this.speed;
        this.velocity.y = this.fwd.y * this.speed;

        this.sprite.position.x += this.velocity.x * delta;
        this.sprite.position.y += this.velocity.y * delta;
    }


    //Rotates sprite to point towards crosshair
    rotateSprite() {
        let axis = {};
        axis.x = 1;
        axis.y = 0;
        let angle = Math.acos((this.fwd.x * axis.x) + (this.fwd.y * axis.y));

        if (this.fwd.y > 0)
            this.sprite.rotation += angle;
        else if (this.fwd.y < 0)
            this.sprite.rotation -= angle;
    }

    //Normalizes vector
    normalize(vector2) {
        let squareSum = Math.sqrt(Math.pow(vector2.x, 2) + Math.pow(vector2.y, 2));
        if (squareSum != 1) {
            vector2.x /= squareSum;
            vector2.y /= squareSum;
        }

    }
}