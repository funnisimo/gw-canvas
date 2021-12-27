import { Canvas, VERTICES_PER_TILE } from "./canvas";
import { DataBuffer } from "./buffer";
import * as Color from "./color";

export class Layer {
  canvas: Canvas;

  fg!: Uint16Array;
  bg!: Uint16Array;
  glyph!: Uint8Array;

  _depth: number;
  _empty = true;

  constructor(canvas: Canvas, depth = 0) {
    this.canvas = canvas;
    this.resize(canvas.width, canvas.height);
    this._depth = depth;
  }

  get width(): number {
    return this.canvas.width;
  }
  get height(): number {
    return this.canvas.height;
  }
  get depth(): number {
    return this._depth;
  }
  get empty(): boolean {
    return this._empty;
  }

  detach() {
    // @ts-ignore
    this.canvas = null;
  }

  resize(width: number, height: number) {
    const size = width * height * VERTICES_PER_TILE;
    if (!this.fg || this.fg.length !== size) {
      this.fg = new Uint16Array(size);
      this.bg = new Uint16Array(size);
      this.glyph = new Uint8Array(size);
    }
  }

  clear() {
    this.fg.fill(0);
    this.bg.fill(0);
    this.glyph.fill(0);
    this._empty = true;
  }

  draw(
    x: number,
    y: number,
    glyph: string | number,
    fg: number | Color.ColorData = 0xfff,
    bg: number | Color.ColorData = -1
  ): void {
    const index = x + y * this.canvas.width;
    if (typeof glyph === "string") {
      glyph = this.canvas.glyphs.forChar(glyph);
    }
    fg = Color.from(fg).toInt();
    bg = Color.from(bg).toInt();

    this.set(index, glyph, fg, bg);
    if (glyph || bg || fg) {
      this._empty = false;
      this.canvas._requestRender();
    }
  }

  set(index: number, glyph: number, fg: number, bg: number): void {
    index *= VERTICES_PER_TILE;
    glyph = glyph & 0xff;
    bg = bg & 0xffff;
    fg = fg & 0xffff;

    for (let i = 0; i < VERTICES_PER_TILE; ++i) {
      this.glyph[index + i] = glyph;
      this.fg[index + i] = fg;
      this.bg[index + i] = bg;
    }
  }

  //   forEach(
  //     cb: (i: number, glyph: number, fg: number, bg: number) => void
  //   ): void {
  //     for (let i = 0; i < this.glyph.length; ++i) {
  //       cb(i, this.glyph[i], this.fg[i], this.bg[i]);
  //     }
  //   }

  copy(buffer: DataBuffer) {
    if (buffer.width !== this.width || buffer.height !== this.height) {
      console.log("auto resizing buffer");
      buffer.resize(this.width, this.height);
    }
    if (!this.canvas) {
      throw new Error("Layer is detached.  Did you resize the canvas?");
    }

    buffer._data.forEach((mixer, i) => {
      let glyph = mixer.ch;
      if (typeof glyph === "string") {
        glyph = this.canvas.glyphs.forChar(glyph);
      }

      this.set(i, glyph, mixer.fg.toInt(), mixer.bg.toInt());
    });
    this._empty = false;
    this.canvas._requestRender();
  }

  copyTo(buffer: DataBuffer) {
    buffer.resize(this.width, this.height);
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const index = (x + y * this.width) * VERTICES_PER_TILE;
        buffer.draw(x, y, this.glyph[index], this.fg[index], this.bg[index]);
      }
    }
  }
}
