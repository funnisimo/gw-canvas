

export class Buffer {
  private _data: Uint32Array;
  private _width: number;
  
  constructor(width:number, height: number) {
    this._width = width;
    this._data = new Uint32Array(width * height);
  }
    
  get data() { return this._data; }
    
  draw(x:number, y:number, glyph:number, fg:number, bg:number) {
    let index = y * this._width + x;
    glyph = glyph & 0xFF;
    bg = bg & 0xFFF;
    fg = fg & 0xFFF;
    const style = (glyph << 24) + (bg << 12) + fg;
    this._data[index] = style;
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

