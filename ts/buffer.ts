
import { Canvas } from './canvas';
import { Color } from './color';


export interface DrawInfo {
  ch?: string;
  glyph?: number;
  fg: Color|number;
  bg: Color|number;
};



export class DataBuffer {
  private _data: Uint32Array;
  private _width: number;
  private _height: number;
  
  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._data = new Uint32Array(width * height);
  }
    
  get data() { return this._data; }
  get width() { return this._width; }
  get height() { return this._height; }
    
  get(x: number, y: number) {
    let index = y * this.width + x;
    const style = this._data[index] || 0;
    const glyph = (style >> 24);
    const bg    = (style >> 12) & 0xFFF;
    const fg    = (style & 0xFFF);
    return { glyph, fg, bg };
  }
  
  protected _toGlyph(ch: string) {
    if (ch === null || ch === undefined) return -1;
    return ch.charCodeAt(0);
  }
  
  draw(x:number, y:number, glyph:number|string=-1, fg:Color|number=-1, bg:Color|number=-1) {
    let index = y * this.width + x;
    const current = this._data[index] || 0;
    
    if (typeof glyph !== 'number') {
      glyph = this._toGlyph(glyph);
    }
    if (typeof fg !== 'number') {
      fg = Color.from(fg).toInt();
    }
    if (typeof bg !== 'number') {
      bg = Color.from(bg).toInt();
    }
    glyph = (glyph >= 0) ? (glyph & 0xFF) : (current >> 24);
    bg = (bg >= 0) ? (bg & 0xFFF) : ((current >> 12) & 0xFFF);
    fg = (fg >= 0) ? (fg & 0xFFF) : (current & 0xFFF);
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data[index] = style;
    return this;
  }

  // This is without opacity - opacity must be done in Mixer
  drawSprite(x:number,y:number,sprite:DrawInfo) {
    const glyph = sprite.ch ? sprite.ch : sprite.glyph;
    // const fg = sprite.fg ? sprite.fg.toInt() : -1;
    // const bg = sprite.bg ? sprite.bg.toInt() : -1;
    return this.draw(x, y, glyph, sprite.fg, sprite.bg);
  }

  blackOut(x:number, y:number) {
    if (arguments.length == 0) {
      return this.fill(0, 0, 0);
    }
    return this.draw(x, y, 0, 0, 0);
  }

  fill(glyph:number|string=0, fg: number=0xFFF, bg: number=0) {
    if (typeof glyph == 'string') {
      glyph = this._toGlyph(glyph);
    }
    glyph = glyph & 0xFF;
    fg = fg & 0xFFF;
    bg = bg & 0xFFF;
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data.fill(style);
    return this;
  }

  copy(other: Buffer) {
    this._data.set(other._data);
    return this;
  }
  
}


export class Buffer extends DataBuffer {
  private _canvas: Canvas;

  constructor(canvas:Canvas) {
    super(canvas.width, canvas.height);
    this._canvas = canvas;
    canvas.copyTo(this);
  }
  
  get canvas() { return this._canvas; }

  _toGlyph(ch: string) {
    return this._canvas.glyphs.forChar(ch);
  }

  render() {
    this._canvas.copy(this);
    return this;
  }
  
  copyFromCanvas() {
    this._canvas.copyTo(this);
    return this;
  }
  
}

