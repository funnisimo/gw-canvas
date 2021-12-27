# Canvas Layers

A Canvas can have many layers. Layers are drawn from the lowest (-255) to highest (255) depth. That way higher depth layers will overwrite lower depth layers. As the layers are drawn, any alpha blending will be done.

The default layer for the Canvas is at depth 0.

```js
const canvas = GWC.withFont({
  font: "arial",
  width: 40,
  height: 10,
  tileWidth: 16,
  tileHeight: 16,
  bg: "gray",
});
SHOW(canvas.node);

const layer0 = canvas.layer(0);
const layer1 = canvas.layer(1);

const HALF_RED = new GWC.color.make([100, 0, 0, 50]);
const HALF_BLUE = new GWC.color.make([0, 0, 100, 50]);

function update() {
  layer0.clear();
  layer1.clear();
  for (let count = 0; count < 100; ++count) {
    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);

    const glyph = Math.floor(Math.random() * 256);
    const fg = Math.floor(Math.random() * 4096);
    const bg = Math.floor(Math.random() * 4096);

    if (Math.random() < 0.5) {
      layer0.draw(x, y, glyph, fg, HALF_RED);
    } else {
      layer1.draw(x, y, glyph, fg, HALF_BLUE);
    }
  }
}

update();
setInterval(() => {
  update();
}, 200);
```
