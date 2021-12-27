import { Mixer } from "./mixer";
export class DataBuffer {
    constructor(width, height) {
        this._data = [];
        this.resize(width, height);
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    resize(width, height) {
        if (this._width === width && this._height === height)
            return;
        this._width = width;
        this._height = height;
        while (this._data.length < width * height) {
            this._data.push(new Mixer());
        }
        this._data.length = width * height; // truncate if was too large
    }
    get(x, y) {
        let index = y * this.width + x;
        return this._data[index];
    }
    _toGlyph(ch) {
        if (ch === null || ch === undefined)
            return -1;
        return ch.charCodeAt(0);
    }
    draw(x, y, glyph = -1, fg = -1, bg = -1) {
        let index = y * this.width + x;
        const current = this._data[index];
        current.draw(glyph, fg, bg);
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
        this._data.forEach((m) => m.draw(glyph, fg, bg));
        return this;
    }
    copy(other) {
        this._data.forEach((m, i) => {
            m.copy(other._data[i]);
        });
        return this;
    }
}
export class Buffer extends DataBuffer {
    constructor(layer) {
        super(layer.width, layer.height);
        this._layer = layer;
        layer.copyTo(this);
    }
    // get canvas() { return this._canvas; }
    _toGlyph(ch) {
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
