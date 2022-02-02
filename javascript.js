import TiledImage from './TiledImage.js';

// =======================================================
// Animation in a canvas
// -------------------------------------------------------
let columnCount = 9;
let rowCount = 4;
let refreshDelay = 100; 			// msec
let loopColumns = true; 			// or by row?
let scale = 1.0;
let tiledImage = new TiledImage("images/skeleton-walk.png", columnCount, rowCount, refreshDelay, loopColumns, scale, null);
tiledImage.changeRow(3);				// One row per animation
tiledImage.changeMinMaxInterval(0, 8); 	// Loop from which column to which column?

// You can stack images!
//tiledImage.addImage("images/item-hood-walk.png");
tiledImage.addImage("images/item-shield-walk.png");

// Other functions :
//	 - tiledImageDOM.setRotationAngle(120);
//   - tiledImage.setFlipped(true);		// Horizontally
//   - tiledImage.setLooped(false);
//   - tiledImage.setPaused(true);

let canvas =  document.getElementById("canvas");
let ctx =canvas.getContext("2d");

const tickCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tiledImage.tick(220, 120, ctx);

    window.requestAnimationFrame(tickCanvas);
}

tickCanvas();

// =======================================================
// Embed animation in a div
// Works the same way, with the same features as canvas, but embeds the sprite in a div instead of a canvas
// -------------------------------------------------------

let node = document.createElement("div");
document.querySelector("#container").append(node);

let tiledImageDOM = new TiledImage("images/skeleton-walk.png", 9, 4, 100, true, 1.0, node);
tiledImageDOM.addImage("images/item-hood-walk.png");

tiledImageDOM.changeRow(3);
tiledImageDOM.setMinMaxDimensions(50, 100, 150, 150);

// Logic where the sprite changes row after animating through its columns
tiledImageDOM.changeMinMaxInterval(0, 8, () => {
    tiledImageDOM.changeRow(1);
    tiledImageDOM.changeMinMaxInterval(0, 8);
});

let x = 10;
let y = 50;

const tickDOM = () => {
    x += 0.5;
    tiledImageDOM.tick(x, y);

    window.requestAnimationFrame(tickDOM);
}

tickDOM();
