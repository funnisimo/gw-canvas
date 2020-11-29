
## Glyphs

Glyphs is a class that manages the glyphs that you can draw on the canvas.  It is a single image that has a grid of 16 x 16 cells, each representing a glyph.  

Here is an example:

![Bitmap Font](./bitmapFont.png)

If you want to more easily use text, then I recommend aligning the font with the ASCII values of the individual characters (32 = ' ', 65 = 'A', 97 = 'a', etc...)


### Loading Glyphs from Images

If you make a bitmap font image that is 16 x 16 tiles, then you can load it as a Glyph.

Using an Image element:

```js
const image = document.getElementById('font');
const glyphs = GW.canvas.Glyphs.fromImage(image);
SHOW(glyphs.node);
```

Using an element ID:

```js
const glyphs = GW.canvas.Glyphs.fromImage('font');
SHOW(glyphs.node);
```

### Loading Glyphs From Fonts

If you do not have a bitmap font handy, you can create one from a font family.  

```js
const glyphs = GW.canvas.Glyphs.fromFont('monospace');
SHOW(glyphs.node);
```

NOTE: Glyphs from images are a little more perfect than the ones generated from a font.  If that is important to you, then I recommend building one from a font and then editing it in your favorite handy dandy image editor.

### Drawing Your Own

If you want to customize a glyph, you can do that via the draw method of the glyph.

```js
const glyphs = GW.canvas.Glyphs.fromFont('monospace');

glyphs.draw(1, (ctx, x, y, w, h) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'red';  // White is required - doing this so you can see it.

  const rad = Math.floor(Math.min(w, h) / 2);

  ctx.beginPath();
  ctx.ellipse(x + Math.floor(w/2), y + Math.floor(h/2), rad, rad, 0, 0, Math.PI * 2);
  ctx.fill();
  return '§'; // the ch you can lookup to get this index
});

SHOW(glyphs.node);
```

NOTE: The fill must be white for everything to work properly.

Now, any canvas using this glyphs will be able to use index=1 to draw a circle.  Also, because we returned a character from the draw function it will be loaded into the character map for lookup via `forChar`.

### Looking Up Characters

When you load a Glyphs from a font, you can lookup the index of a character.

```js
const glyphs = GW.canvas.Glyphs.fromFont('monospace');
SHOW('\u263a = ' + glyphs.forChar('\u263a'));
```
