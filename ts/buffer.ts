
import { Canvas } from './canvas';

export class Buffer {
  private _data: Uint32Array;
  private _canvas: Canvas;
  
  constructor(canvas: Canvas) {
    this._canvas = canvas;
    this._data = new Uint32Array(canvas.width * canvas.height);
    canvas.copyTo(this);
  }
    
  get data() { return this._data; }
  get width() { return this._canvas.width; }
  get height() { return this._canvas.height; }
    
  get(x: number, y: number) {
    let index = y * this.width + x;
    const style = this._data[index] || 0;
    const glyph = (style >> 24);
    const bg    = (style >> 12) & 0xFFF;
    const fg    = (style & 0xFFF);
    return { glyph, fg, bg };
  }
    
  draw(x:number, y:number, glyph:number|string=-1, fg:number=-1, bg:number=-1) {
    let index = y * this.width + x;
    const current = this._data[index] || 0;
    
    if (typeof glyph == 'string') {
      glyph = this._canvas.glyphs.forChar(glyph);
    }
    glyph = (glyph >= 0) ? (glyph & 0xFF) : (current >> 24);
    bg = (bg >= 0) ? (bg & 0xFFF) : ((current >> 12) & 0xFFF);
    fg = (fg >= 0) ? (fg & 0xFFF) : (current & 0xFFF);
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data[index] = style;
  }

  fill(bg: number=0, glyph:number|string=0, fg: number=0xFFF) {
    if (typeof glyph == 'string') {
      glyph = this._canvas.glyphs.forChar(glyph);
    }
    glyph = glyph & 0xFF;
    bg = bg & 0xFFF;
    fg = fg & 0xFFF;
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data.fill(style);
  }

  copy(other: Buffer) {
    this._data.set(other._data);
  }
  
  render() {
    this._canvas.copy(this);
  }
  
  copyFromCanvas() {
    this._canvas.copyTo(this);
  }
}

