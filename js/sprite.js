import { Color } from "./color";
export class Sprite {
    constructor(ch, fg, bg, opacity) {
        this.ch = ch;
        this.fg = fg;
        this.bg = bg;
        this.opacity = opacity;
    }
    static make(...args) {
        let ch = null, fg = -1, bg = -1, opacity;
        if (args.length == 0) {
            return new Sprite(null, -1, -1);
        }
        else if (args.length == 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        if (args.length > 1) {
            ch = args[0] || null;
            fg = args[1];
            bg = args[2];
            opacity = args[3];
        }
        else if (args.length == 1) {
            if (typeof args[0] === "string") {
                bg = args[0];
            }
            else {
                const sprite = args[0];
                ch = sprite.ch || null;
                fg = sprite.fg || -1;
                bg = sprite.bg || -1;
                opacity = sprite.opacity;
            }
        }
        if (typeof fg === "string")
            fg = Color.from(fg);
        else if (Array.isArray(fg))
            fg = Color.make(fg);
        else if (fg === undefined || fg === null)
            fg = -1;
        if (typeof bg === "string")
            bg = Color.from(bg);
        else if (Array.isArray(bg))
            bg = Color.make(bg);
        else if (bg === undefined || bg === null)
            bg = -1;
        return new this(ch, fg, bg, opacity);
    }
    static install(name, ...args) {
        let sprite;
        // @ts-ignore
        sprite = this.make(...args);
        sprite.name = name;
        sprites[name] = sprite;
        return sprite;
    }
}
export const sprites = {};
