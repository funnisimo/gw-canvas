import { VERTICES_PER_TILE } from "./canvas";
import * as Color from "./color";
export class Layer {
    constructor(canvas) {
        const size = canvas.width * canvas.height * VERTICES_PER_TILE;
        this.canvas = canvas;
        this.fg = new Uint16Array(size);
        this.bg = new Uint16Array(size);
        this.glyph = new Uint8Array(size);
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
    draw(x, y, glyph, fg = 0xfff, bg = 0x000) {
        const index = x + y * this.canvas.width;
        if (typeof glyph === "string") {
            glyph = this.canvas.glyphs.forChar(glyph);
        }
        if (typeof fg !== "number") {
            fg = Color.from(fg).toInt();
        }
        if (typeof bg !== "number") {
            bg = Color.from(bg).toInt();
        }
        this.set(index, glyph, fg, bg);
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
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const index = (x + y * this.width) * VERTICES_PER_TILE;
                buffer.draw(x, y, this.glyph[index], this.fg[index], this.bg[index]);
            }
        }
    }
}
