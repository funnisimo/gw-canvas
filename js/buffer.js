export class Buffer {
    constructor(canvas) {
        this._canvas = canvas;
        this._data = new Uint32Array(canvas.width * canvas.height);
    }
    get data() { return this._data; }
    get width() { return this._canvas.width; }
    get height() { return this._canvas.height; }
    draw(x, y, glyph, fg, bg) {
        let index = y * this.width + x;
        glyph = glyph & 0xFF;
        bg = bg & 0xFFF;
        fg = fg & 0xFFF;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data[index] = style;
    }
    drawChar(x, y, ch, fg, bg) {
        const glyphs = this._canvas.glyphs;
        const glyph = glyphs.forChar(ch);
        this.draw(x, y, glyph, fg, bg);
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
