## Canvas

A canvas object allows you to draw colored glyphs efficiently into a canvas. You can create one in one of two methods:

- withImage - With a bitmapFont image
- withFont - With a generated bitmapFont for a system font

Both of these create an object that has the following properties:

- node - Returns the HTMLCanvasElement that the object wraps
- width - Returns the number of cells wide in the drawing area
- height - Returns the number of cells tall in the drawing area
- tileWidth - The pixel width of a single cell
- tileHeight - The pixel height of a single cell
- pxWidth - The width of the canvas node
- pxHeight - The height of the canvas node
- glyphs - The Glyphs object that this canvas is using for drawing. This is changeable at run-time.

These methods are also available:

- draw - Draw a single glyph
- resize - Change the number of cells displayed (and therefore the size of the canvas);
- copy - Draws all of the data from the provided buffer
- copyTo - Puts the current drawing data into the provided buffer
- render - Optionally force a render. This is there so that you can control the timing of the rendering within a `requestAnimationFrame` call. Maybe doing some animation first.

### Example with Image

```js
const canvas = GW.canvas.withImage({ image: "font", width: 40, height: 10 });
SHOW(canvas.node);

for (let x = 0; x < canvas.width; ++x) {
  for (let y = 0; y < canvas.height; ++y) {
    const glyph = Math.floor(Math.random() * 256);
    const fg = Math.floor(Math.random() * 4096);
    const bg = Math.floor(Math.random() * 4096);
    canvas.draw(x, y, glyph, fg, bg);
  }
}
canvas.draw(0, 0, 65, 0xf00, 0x0f0);
```

### Example with Font

```js
const canvas = GW.canvas.withFont({
  font: "arial",
  width: 40,
  height: 10,
  tileWidth: 12,
  tileHeight: 12,
});
SHOW(canvas.node);

function update() {
  for (let x = 0; x < canvas.width; ++x) {
    for (let y = 0; y < canvas.height; ++y) {
      const glyph = Math.floor(Math.random() * 256);
      const fg = Math.floor(Math.random() * 4096);
      canvas.draw(x, y, glyph, fg);
    }
  }
}

update();
setInterval(() => {
  canvas.resize(Math.floor(Math.random() * 10) + 20, 10);
  update();
}, 2000);
```
