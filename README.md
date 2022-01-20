# AnimatedSprite

Helper class to animate your sprites.

## Installation

````
$ npm install --save @ftheriault/animatedsprite
````

### Simple example

For this to work, it must be imported from a JavaScript file and used in an HTML file. A valid image path must be specified.

````javascript
import TiledImage from '@ftheriault/animatedsprite';

let columnCount = 9;        // in the sprite sheet
let rowCount = 4;           // in the sprite sheet
let changeTileDelay = 100;  // msec. Passing from a cell to the other
let loopHorizontally = true;// Loop horizontally or vertically?
let scale = 1.0;            // Default size, could be scaled down or up

let node = document.createElement("div");
document.body.append(node);
let tiledImage = new TiledImage("images/skeleton-walk.png", columnCount, rowCount, changeTileDelay, loopHorizontally, scale, node);

tiledImage.changeRow(3);    // Which row to display in the sprite sheet
tiledImage.changeMinMaxInterval(0, 8); // Columns to loop over. In this case, from column 0 to 8

let posX = 50;

const tick = () => {
    posX += 0.5;
    tiledImage.tick(posX, y);

    window.requestAnimationFrame(tick);
}

tick();

````

### Other examples

See `index.html` for examples using Canvas and DOM.

## Credits
Thanks to wulax for the sprite sheet !
http://opengameart.org/content/lpc-medieval-fantasy-character-sprites

## Creating sprite sheets

To create a sprite sheet with fixed width/height cells, you can use this tool : https://apps-de-cours.com/utils/sprite-sheet-creator

github: https://github.com/ftheriault/SpriteSheetGridHelper