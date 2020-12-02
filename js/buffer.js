;
export class Buffer {
    constructor(canvas) {
        this._canvas = canvas;
        this._data = new Uint32Array(canvas.width * canvas.height);
        canvas.copyTo(this);
    }
    get data() { return this._data; }
    get width() { return this._canvas.width; }
    get height() { return this._canvas.height; }
    get(x, y) {
        let index = y * this.width + x;
        const style = this._data[index] || 0;
        const glyph = (style >> 24);
        const bg = (style >> 12) & 0xFFF;
        const fg = (style & 0xFFF);
        return { glyph, fg, bg };
    }
    draw(x, y, glyph = -1, fg = -1, bg = -1) {
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
        return this;
    }
    // This is without opacity - opacity is more work...
    drawSprite(x, y, sprite) {
        const glyph = sprite.ch ? sprite.ch : -1;
        const fg = sprite.fg ? sprite.fg.toInt() : -1;
        const bg = sprite.bg ? sprite.bg.toInt() : -1;
        return this.draw(x, y, glyph, fg, bg);
    }
    blackOut(x, y) {
        return this.draw(x, y, 0, 0, 0);
    }
    fill(bg = 0, glyph = 0, fg = 0xFFF) {
        if (typeof glyph == 'string') {
            glyph = this._canvas.glyphs.forChar(glyph);
        }
        glyph = glyph & 0xFF;
        bg = bg & 0xFFF;
        fg = fg & 0xFFF;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data.fill(style);
        return this;
    }
    copy(other) {
        this._data.set(other._data);
        return this;
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
