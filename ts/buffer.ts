import { Layer } from "./layer";
import * as Color from "./color";
import { Mixer } from "./mixer";

export interface DrawInfo {
  ch?: string | null;
  glyph?: number;
  fg: Color.Color | number;
  bg: Color.Color | number;
}

export class DataBuffer {
  _data: Mixer[];
  _width!: number;
  _height!: number;

  constructor(width: number, height: number) {
    this._data = [];
    this.resize(width, height);
  }

  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }

  resize(width: number, height: number) {
    if (this._width === width && this._height === height) return;

    this._width = width;
    this._height = height;
    while (this._data.length < width * height) {
      this._data.push(new Mixer());
    }
    this._data.length = width * height; // truncate if was too large
  }

  get(x: number, y: number) {
    let index = y * this.width + x;
    return this._data[index];
  }

  _toGlyph(ch: string) {
    if (ch === null || ch === undefined) return -1;
    return ch.charCodeAt(0);
  }

  draw(
    x: number,
    y: number,
    glyph: number | string = -1,
    fg: Color.ColorBase = -1,
    bg: Color.ColorBase = -1
  ) {
    let index = y * this.width + x;
    const current = this._data[index];
    current.draw(glyph, fg, bg);
    return this;
  }

  // This is without opacity - opacity must be done in Mixer
  drawSprite(x: number, y: number, sprite: DrawInfo) {
    let glyph = sprite.ch
      ? sprite.ch
      : sprite.glyph !== undefined
      ? sprite.glyph
      : -1;
    // const fg = sprite.fg ? sprite.fg.toInt() : -1;
    // const bg = sprite.bg ? sprite.bg.toInt() : -1;
    return this.draw(x, y, glyph, sprite.fg, sprite.bg);
  }

  blackOut(x: number, y: number) {
    if (arguments.length == 0) {
      return this.fill(0, 0, 0);
    }
    return this.draw(x, y, 0, 0, 0);
  }

  fill(glyph: number | string = 0, fg: number = 0xfff, bg: number = 0) {
    this._data.forEach((m) => m.draw(glyph, fg, bg));
    return this;
  }

  copy(other: DataBuffer) {
    this._data.forEach((m, i) => {
      m.copy(other._data[i]);
    });
    return this;
  }
}

export class Buffer extends DataBuffer {
  private _layer: Layer;

  constructor(layer: Layer) {
    super(layer.width, layer.height);
    this._layer = layer;
    layer.copyTo(this);
  }

  // get canvas() { return this._canvas; }

  _toGlyph(ch: string) {
    return this._layer.canvas.glyphs.forChar(ch);
  }

  render() {
    this._layer.copy(this);
    return this;
  }

  copyFromCanvas() {
    this._layer.copyTo(this);
    return this;
  }
}
