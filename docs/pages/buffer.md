
## Buffer

The Buffer class allows you to copy and build screens.   When it is created, a Buffer will get a copy of the canvas contents.  The buffers are especially useful for reverting the canvas back to where it was before you did some drawing.

```js
const canvas = GW.canvas.withFont({ width: 20, height: 5 });
SHOW(canvas);

canvas.draw(1, 2, 65, 0xF00);

const buffer = new GW.canvas.Buffer(canvas);

// draw a bunch of A's
for(let i = 0; i < 20; ++i) {
  canvas.draw(i, 3, 65, 0xFFF);
}

// undo drawing after a few seconds
setTimeout(() => {
canvas.copy(buffer);
}, 2000);

```

## Fill

You can fill a buffer with glyph+colors.

```js
const canvas = GW.canvas.withFont({ width: 20, height: 5 });
SHOW(canvas);
const buffer = new GW.canvas.Buffer(canvas);
buffer.fill(0, 0, 0x333); //  glyph, fg, bg
buffer.draw(2, 2, 65, 0xF00);
buffer.draw(3, 2, 66, 0x0F0);
buffer.draw(4, 2, 67, 0x00F);
buffer.draw(5, 2, 68, 0xFFF);
buffer.render();
```

NOTICE: The bg from the drawChar calls did not change the fill bg.  This happened because we did not pass in a bg color.

## Draw - Char

Buffers allow you to draw based on chars that are converted to glyphs via the canvas' glyph object.

```js
const canvas = GW.canvas.withFont({ width: 20, height: 5 });
SHOW(canvas);
const buffer = new GW.canvas.Buffer(canvas);
buffer.fill(0, 0, 0x333);
buffer.draw(2, 2, 't', 0xF00);
buffer.draw(3, 2, 'e', 0x0F0);
buffer.draw(4, 2, 's', 0x00F);
buffer.draw(5, 2, 't', 0xFFF);
buffer.render();
```

## Copy From Canvas

You can also reset this buffer to the current canvas values.

```js
const canvas = GW.canvas.withFont({ width: 20, height: 5 });
SHOW(canvas);

canvas.draw(2, 2, 70, 0xF00, 0x333);

const buffer = new GW.canvas.Buffer(canvas);
buffer.fill(0, 0, 0x333);
buffer.draw(2, 2, 't', 0xF00);
SHOW(buffer.get(2, 2));

buffer.copyFromCanvas();
SHOW(buffer.get(2, 2));
```

