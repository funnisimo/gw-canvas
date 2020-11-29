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
const canvas = GW.canvas.withImage({ image: 'image_id', width: 50, height: 38 });
document.body.appendChild(canvas.node);

canvas.draw(0, 0, 97, 0xF00, 0xFFF); // usually a red 'a' on white background.
```

## More Information

Check out the online interactive [Manual](https://funnisimo.github.io/gw-canvas/).

## Credit

This project started as an attempt to modify [Fastiles](https://github.com/ondras/fastiles), but @ondras and I figured out that we had different goals.  Based on that I created this library.  However, the hard work in the code is all done by @ondras - by that I mean setting up the initial WebGl pipeline and getting it to work.  I changed some things, but the heart of it is still the same as Fastiles.  Many thanks to @ondras for the inspiration and the launching point.
