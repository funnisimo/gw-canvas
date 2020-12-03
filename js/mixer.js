import { Color } from './color';
export class Mixer {
    constructor() {
        this.ch = 0;
        this.fg = new Color();
        this.bg = new Color();
    }
    copy(other) {
        this.ch = other.ch;
        this.fg.copy(other.fg);
        this.bg.copy(other.bg);
        return this;
    }
    clone() {
        const other = new Mixer();
        other.copy(this);
        return other;
    }
    nullify() {
        this.ch = 0;
        this.fg.nullify();
        this.bg.nullify();
        return this;
    }
    blackOut() {
        this.ch = 0;
        this.fg.blackOut();
        this.bg.blackOut();
        return this;
    }
    draw(ch = -1, fg = -1, bg = -1) {
        if (ch !== -1) {
            this.ch = ch;
        }
        if (fg != -1) {
            fg = Color.from(fg);
            this.fg.copy(fg);
        }
        if (bg != -1) {
            bg = Color.from(bg);
            this.bg.copy(bg);
        }
    }
    drawSprite(info, opacity = 100) {
        if (opacity <= 0)
            return;
        if (info.ch)
            this.ch = info.ch;
        if (info.fg)
            this.fg.mix(info.fg, opacity);
        if (info.bg)
            this.bg.mix(info.bg, opacity);
        return this;
    }
    invert() {
        [this.bg, this.fg] = [this.fg, this.bg];
        return this;
    }
    multiply(color, fg = true, bg = true) {
        color = Color.from(color);
        if (fg) {
            this.fg.multiply(color);
        }
        if (bg) {
            this.bg.multiply(color);
        }
        return this;
    }
    mix(color, fg = 100, bg = fg) {
        color = Color.from(color);
        if (fg > 0) {
            this.fg.mix(color, fg);
        }
        if (bg > 0) {
            this.bg.mix(color, bg);
        }
        return this;
    }
    add(color, fg = 100, bg = fg) {
        color = Color.from(color);
        if (fg > 0) {
            this.fg.add(color, fg);
        }
        if (bg > 0) {
            this.bg.add(color, bg);
        }
        return this;
    }
    separate() {
        Color.separate(this.fg, this.bg);
        return this;
    }
    bake() {
        this.fg.bake();
        this.bg.bake();
        return {
            ch: this.ch,
            fg: this.fg.toInt(),
            bg: this.bg.toInt(),
        };
    }
}
