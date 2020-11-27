# gw-canvas

Library for fast rendering colorized bitmap fonts. 

## Features

  - Supports up to 256 glyphs from a 16x16 image
  - Allows changing glyphs
  - Updates are batched via `requestAnimationFrame`
  - Uses 4096 colors
  - Written in TypeScript
  - Can generate bitmap font images

## Speed

  - WebGL2
  - No per-render memory allocations
  - Only one GL draw call for the whole canvas
  - Minimized JS data transfer (data set only for [Provoking vertices](https://www.khronos.org/opengl/wiki/Primitive#Provoking_vertex))
  - Thousands of tiles rendered at 60 fps

## Colors

Colors are represented by 12 bit numbers with 4 bits each for red, green, and blue values.

```js
const red = 0xF00;
const green = 0x0F0;
const blue = 0x00F;
const yellow = 0xFF0;
```

These color integers are used for both the foreground and background drawing colors.

## Glyphs

The Canvas works by using a bitmap font image that it loads into WebGL.  The image *MUST* be a 16x16 layout for the glyphs.  The size of the glyphs is inferred by the Canvas at construction time.

```js
const glyphs = new Image();
glyphs.src = 'url | data';
await glyphs.decode();

const canvas = GWCanvas.withImage({ image: glyphs, width: 50, height: 38 });
document.body.appendChild(canvas.node);

canvas.draw(0, 0, 97, 0xF00, 0xFFF); // usually a red 'a' on white background.
```

## Canvas

The Canvas wraps an HTTPCanvasElement.  It uses WebGL2 to draw the glyphs.

Options available at canvas construction time:
- width - the number of tiles the canvas contains in the X axis (default 50)
- height - the number of tiles the canvas contains in the Y axis (default 25)
- glyphs - the image that has the 16x16 layout of the glyphs (will create a default if not given)
- node - the HTMLCanvasElement to use (will create if not given)

Once you create a canvas, you can call draw on it as much as you want.  When you do, it will automatically use requestAnimationFrame to batch the draw calls.

If you want to resize the Canvas, use the `resize` method.  If you want to change the glyphs, set the `glyphs` property.

## Example

```js
import { withImage } from "gw-canvas";

async function init() {
  const glyphs = new Image();
  glyphs.src = './font.png';
  await glyphs.decode();

  const canvas = withImage({ image: glyphs, width: 24, height: 18 });
  document.body.appendChild(canvas.node)

  // basic drawing
  canvas.draw(
  	0, 0,   // position
  	65,     // glyph index (65=A)
  	0x0D4,  // foreground color 
  	0x333   // background color 
  );
}

init();
```

## More on Glyphs

The Glyphs class that makes it easy to create glyph bitmaps from standard fonts.  You use it like this:

The options available for the creation of the glyph are:
* tileWidth - the width of a tile in pixels
* tileHeight - the height of a tile in pixels
* fontSize - the fontsize to use when drawing the glyphs
* font - the name of the font to use when drawing glyphs (default=monospace)
* basic - A boolean to indicate that you want only the basic ascii text characters (32-127) drawn

```js
const canvas = GWCanvas.withFont({ width: 30, height: 30, tileWidth: 12, tileHeight: 12, fontSize: 14, font: 'monospace' });
```

Once you have a glyph object, you can modify it by using the draw method in one of 2 ways:
* draw(index, char) - draws the given character using the configured font in the spot indicated by the index
* draw(index, fn) - calls your function with the following parameters:
  - ctx: CanvasRenderingContext2D - the rendering context you can use to draw into the tile
  - x, y, width, height: number - the x, y, width, height of the region to draw the glyph into

Custom draw functions are protected by a clipping region that will keep the glyphs from overwriting each other.

If you change the glyphs after the Canvas is created, you can either update the glyphs manually or let the canvas object automatically do it for you.

```js
glyphs.draw(35, '\u2302');
glyphs.draw(32, (ctx, x, y, w, h) => ctx.fillText('-', x, y) );

// manually
canvas.uploadGlyphs();

// automatically
// happens during render process
```

## Credit

This project started as an attempt to modify [Fastiles](https://github.com/ondras/fastiles), but @ondras and I figured out that we had different goals.  Based on that I created this library.  However, the hard work in the code is all done by @ondras - by that I mean setting up the initial WebGl pipeline and getting it to work.  I changed some things, but the heart of it is still the same as Fastiles.  Many thanks to @ondras for the inspiration and the launching point.
