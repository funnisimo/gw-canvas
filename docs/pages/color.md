## Color

Color objects allow you to easily manipulate colors. They hold information about the Red, Green, and Blue values of the color as well as data about any random variance the color should have.

By default, Colors are created with a null color - no color. A null color will not draw into a canvas. Any existing color will be unchanged.

```js
const canvas = GWC.withFont({
  font: "arial",
  width: 40,
  height: 10,
  tileWidth: 12,
  tileHeight: 12,
});
SHOW(canvas.node);
const buffer = new GWC.Buffer(canvas.layer);
buffer.fill(" ", 0x00f, 0x660);
buffer.render();

const c = new GWC.color.Color();
SHOW(c.isNull(), c.toInt());

buffer.draw(2, 2, "@", c); // @ in null which means the original blue will stay
buffer.render();
```

Notice that the '@' is drawn in Blue - which is the color from the fill.

### Underlying Data

Color objects do not expose their components. (It is Javascript, so they are there for you in the \_r, \_g, \_b properties if you want to mess with them, but you should resist the temptation) Instead, they are designed so that you combine them using simple proportions (mix), add them (add), and multiply them (multiply). Using these methods on a Color, you can create lots of nice effects - like lighting and gasses.

#### Creating Color Objects

Colors can be created many ways:

- From percentages
- From CSS strings (not names)
- From RGB integer values
- From RGB component arrays
- From percentage component arrays

```js
const a = new GWC.color.Color(100, 50, 21);
SHOW(a.toString());

// css strings
const b = GWC.color.fromCss("#ff33aa");
SHOW(b.toString());
const b2 = GWC.color.fromCss("#f3a");
SHOW(b2.toString());

// rgb integer values
const c = GWC.color.fromNumber(0x3af295);
SHOW(c.toString());

// RGB component array
const d = GWC.color.fromArray([100, 50, 0], true);
SHOW(d.toString());

// Percentage component array
const e = GWC.color.fromArray([100, 50, 0]);
SHOW(e.toString());
```

All of these coerce their parameters into the same underlying dataset. You will notice that in some of the values that there is some variance between the values supplied and the values printed. This is because under the covers we are converting everything into percentages and that causes some rounding. Not to worry, we are eventually going to be converting to the 4096 color spectrum for drawing so there will be a lot of rounding for that.

#### Separating Colors

Sometimes you need to ensure that the foreground and background colors are distinct, or that 2 colors in a palette are distinct. You can do that with the `Color.separate(a,b)` function.

```js
const canvas = GWC.withFont({
  font: "arial",
  width: 40,
  height: 10,
  tileWidth: 12,
  tileHeight: 12,
  size: 10,
});
SHOW(canvas.node);
const buffer = new GWC.Buffer(canvas.layer);
buffer.fill(" ", 0x000, 0x000);
buffer.render();

const fg = GWC.color.fromNumber(0xff0);
const bg = GWC.color.fromNumber(0xd94);

buffer.draw(1, 1, -1, -1, fg);
buffer.draw(1, 2, "@", fg, bg);
buffer.draw(1, 3, -1, -1, bg);

const [fg2, bg2] = GWC.color.separate(fg, bg);

buffer.draw(3, 1, -1, -1, fg2);
buffer.draw(3, 2, "@", fg2, bg2);
buffer.draw(3, 3, -1, -1, bg2);

buffer.render();
```
