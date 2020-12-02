
## Sprite

Sprites are objects that hold the information about how the container object should be represented on the screen.  They have 4 fields:
  * ch - The character (glyph)
  * fg - The foreground color
  * bg - The background color
  * opacity - How much we blend this sprite into any current information (100 = none of the information under this sprite, 0 = all)
  
All of the fields are optional.  Unset values will not be used when the sprite is drawn into a buffer.
  
```js
const canvas = GW.canvas.withFont({ width: 20, height: 5 });
SHOW(canvas);

const buffer = new GW.canvas.Buffer(canvas);

const tile = {
  ch: '.', 
  fg: GW.canvas.Color.make(0x666), 
  bg: GW.canvas.Color.make(0x333),
}

const potion = {
  ch: 'p', 
  fg: GW.canvas.Color.make(0xF0C),
};

// We draw the items in order of their depth, starting with one on the lowest level (ground)
buffer.drawSprite(1, 2, tile);

buffer.drawSprite(3, 2, tile);
buffer.drawSprite(3, 2, potion);

buffer.drawSprite(5, 2, potion);

buffer.render();
```




