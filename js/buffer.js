import { Color } from "./color";
export class DataBuffer {
    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._data = new Uint32Array(width * height);
    }
    get data() {
        return this._data;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get(x, y) {
        let index = y * this.width + x;
        const style = this._data[index] || 0;
        const glyph = style >> 24;
        const bg = (style >> 12) & 0xfff;
        const fg = style & 0xfff;
        return { glyph, fg, bg };
    }
    _toGlyph(ch) {
        if (ch === null || ch === undefined)
            return -1;
        return ch.charCodeAt(0);
    }
    draw(x, y, glyph = -1, fg = -1, bg = -1) {
        let index = y * this.width + x;
        const current = this._data[index] || 0;
        if (typeof glyph !== "number") {
            glyph = this._toGlyph(glyph);
        }
        if (typeof fg !== "number") {
            fg = Color.from(fg).toInt();
        }
        if (typeof bg !== "number") {
            bg = Color.from(bg).toInt();
        }
        glyph = glyph >= 0 ? glyph & 0xff : current >> 24;
        bg = bg >= 0 ? bg & 0xfff : (current >> 12) & 0xfff;
        fg = fg >= 0 ? fg & 0xfff : current & 0xfff;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data[index] = style;
        return this;
    }
    // This is without opacity - opacity must be done in Mixer
    drawSprite(x, y, sprite) {
        let glyph = sprite.ch
            ? sprite.ch
            : sprite.glyph !== undefined
                ? sprite.glyph
                : -1;
        // const fg = sprite.fg ? sprite.fg.toInt() : -1;
        // const bg = sprite.bg ? sprite.bg.toInt() : -1;
        return this.draw(x, y, glyph, sprite.fg, sprite.bg);
    }
    blackOut(x, y) {
        if (arguments.length == 0) {
            return this.fill(0, 0, 0);
        }
        return this.draw(x, y, 0, 0, 0);
    }
    fill(glyph = 0, fg = 0xfff, bg = 0) {
        if (typeof glyph == "string") {
            glyph = this._toGlyph(glyph);
        }
        glyph = glyph & 0xff;
        fg = fg & 0xfff;
        bg = bg & 0xfff;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data.fill(style);
        return this;
    }
    copy(other) {
        this._data.set(other._data);
        return this;
    }
}
export class Buffer extends DataBuffer {
    constructor(canvas) {
        super(canvas.width, canvas.height);
        this._canvas = canvas;
        canvas.copyTo(this);
    }
    // get canvas() { return this._canvas; }
    _toGlyph(ch) {
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
