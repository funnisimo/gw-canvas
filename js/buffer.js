export class Buffer {
    constructor(width, height) {
        this._width = width;
        this._data = new Uint32Array(width * height);
    }
    get data() { return this._data; }
    draw(x, y, glyph, fg, bg) {
        let index = y * this._width + x;
        glyph = glyph & 0xFF;
        bg = bg & 0xFFF;
        fg = fg & 0xFFF;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data[index] = style;
    }
    fill(glyph = 0, fg = 0xFFF, bg = 0) {
        glyph = glyph & 0xFF;
        bg = bg & 0xFFF;
        fg = fg & 0xFFF;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data.fill(style);
    }
    copy(other) {
        this._data.set(other._data);
    }
}
