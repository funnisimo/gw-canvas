
## Color

Color objects allow you to easily manipulate colors.  They hold information about the Red, Green, and Blue values of the color as well as data about any random variance the color should have.

By default, Colors are created with a null color - no color.

```js
const c = new GW.canvas.Color();
SHOW(c.isNull());
```

Colors can also be created with RGB values:

```js
const c = new GW.canvas.Color(100,100,100);
SHOW(c.toString(), c.isNull());
```

