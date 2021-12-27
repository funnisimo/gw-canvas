## Mixer

Mixers are objects that let you combine and manipulate a single cell before drawing it into either a buffer or the canvas itself. They hold the values from a cell:

- ch - The character (or glyph)
- fg - The foreground color
- bg - The background color

All of the fields are optional. Unset values will not be used when the sprite is drawn into a buffer.

```js
const canvas = GWC.withFont({ width: 20, height: 5 });
SHOW(canvas);

const buffer = new GWC.Buffer(canvas.layer);

const tile = {
  ch: ".",
  fg: 0x666,
  bg: 0x333,
};

const potion = {
  ch: "p",
  fg: 0xf0c,
};

const light = GWC.color.fromArray([50, 50, 200]);
const mixer = new GWC.Mixer();

buffer.drawSprite(3, 1, tile);
mixer.drawSprite(tile);
buffer.drawSprite(3, 2, mixer);

buffer.drawSprite(4, 1, potion);
mixer.drawSprite(potion);
buffer.drawSprite(4, 2, mixer);

// Add some eerie blue light
mixer.multiply(light);
buffer.drawSprite(5, 2, mixer);
buffer.draw(5, 1, -1, -1, light.normalize());

// make sure the fore and background colors are distinguishable
mixer.separate();
buffer.drawSprite(6, 2, mixer);

// flip the fore and back colors
mixer.invert();
buffer.drawSprite(7, 2, mixer);

// Fix any random color elements
const data = mixer.bake();
SHOW(data);
buffer.drawSprite(8, 2, mixer);
buffer.drawSprite(8, 1, data);

buffer.render();
```
