import { VERTICES_PER_TILE } from "./canvas";
import * as Color from "./color";
export class Layer {
    constructor(canvas, depth = 0) {
        this._empty = true;
        this.canvas = canvas;
        this.resize(canvas.width, canvas.height);
        this._depth = depth;
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
    get depth() {
        return this._depth;
    }
    get empty() {
        return this._empty;
    }
    detach() {
        // @ts-ignore
        this.canvas = null;
    }
    resize(width, height) {
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
    draw(x, y, glyph, fg = 0xfff, bg = -1) {
        const index = x + y * this.canvas.width;
        if (typeof glyph === "string") {
            glyph = this.canvas.glyphs.forChar(glyph);
        }
        fg = Color.from(fg).toInt();
        bg = Color.from(bg).toInt();
        this.set(index, glyph, fg, bg);
        if (glyph || fg || bg) {
            this._empty = false;
        }
    }
    set(index, glyph, fg, bg) {
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
    copy(buffer) {
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
        this.canvas._requestRender();
    }
    copyTo(buffer) {
        buffer.resize(this.width, this.height);
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const index = (x + y * this.width) * VERTICES_PER_TILE;
                buffer.draw(x, y, this.glyph[index], this.fg[index], this.bg[index]);
            }
        }
    }
}
