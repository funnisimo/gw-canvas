import { Color } from './color';
;
export class Sprite {
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
        const other = new Sprite();
        other.copy(this);
        return other;
    }
    clear() {
        this.ch = 0;
        this.fg.clear();
        this.bg.clear();
        return this;
    }
    draw(sprite, opacity = 100) {
        if (opacity <= 0)
            return;
        if (sprite.ch)
            this.ch = sprite.ch;
        if (sprite.fg)
            this.fg.mix(sprite.fg, opacity);
        if (sprite.bg)
            this.bg.mix(sprite.bg, opacity);
        return this;
    }
    swapColors() {
        [this.bg, this.fg] = [this.fg, this.bg];
        return this;
    }
}
