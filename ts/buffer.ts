
import { Canvas } from './canvas';
import { Glyphs } from './glyphs';

export class Buffer {
  private _data: Uint32Array;
  private _canvas: Canvas;
  
  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._data = new Uint32Array(canvas.width * canvas.height);
  }
    
  get data() { return this._data; }
  get width() { return this._canvas.width; }
  get height() { return this._canvas.height; }
    
  draw(x:number, y:number, glyph:number, fg:number, bg:number) {
    let index = y * this.width + x;
    glyph = glyph & 0xFF;
    bg = bg & 0xFFF;
    fg = fg & 0xFFF;
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data[index] = style;
  }

  drawChar(x:number, y:number, ch:string, fg:number, bg:number) {
    const glyphs = this._canvas.glyphs as Glyphs;
    const glyph = glyphs.forChar(ch);
    this.draw(x, y, glyph, fg, bg);
  }
  
  fill(glyph:number=0, fg: number=0xFFF, bg: number=0) {
    glyph = glyph & 0xFF;
    bg = bg & 0xFFF;
    fg = fg & 0xFFF;
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data.fill(style);
  }
  
  copy(other: Buffer) {
    this._data.set(other._data);
  }
}

