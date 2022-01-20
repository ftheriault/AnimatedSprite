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

let columnCount = 9;
let rowCount = 4;
let changeTileDelay = 100; //msec
let loopHorizontally = true;
let scale = 1.0;

let node = document.createElement("div");
document.body.append(node);
let tiledImageDOM = new TiledImage("images/skeleton-walk.png", columnCount, rowCount, changeTileDelay, loopHorizontally, scale, node);

tiledImageDOM.changeRow(3);
tiledImageDOM.changeMinMaxInterval(0, 8);

let x = 50;
let y = 50;

const tick = () => {
    x += 0.5;
    tiledImageDOM.tick(x, y);

    window.requestAnimationFrame(tick);
}

tick();

````

### Other examples

See `index.html` for examples using Canvas and DOM.

## Credits
Thanks to wulax for the sprite sheet !
http://opengameart.org/content/lpc-medieval-fantasy-character-sprites

## Used with...

This is useful with the tool to create a proper stylesheet : https://github.com/ftheriault/SpriteSheetGridHelper