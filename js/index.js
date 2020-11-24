import { Canvas } from "./canvas.js";
import { Glyphs } from "./glyphs.js";
export { Canvas, Glyphs };
export function withImage(image) {
    let el;
    let opts = image;
    if (opts.image) {
        image = opts.image;
    }
    else {
        opts = {};
    }
    if (typeof image === 'string') {
        if (image.startsWith('data:')) {
            throw new Error('Load data into an Image element first.');
        }
        else {
            el = document.getElementById(image);
            if (!el) {
                throw new Error('Could not find element with id:' + image);
            }
        }
    }
    else if (image instanceof HTMLImageElement) {
        el = image;
    }
    opts.glyphs = Glyphs.fromImage(el);
    return new Canvas(opts);
}
export function withFont(src) {
    if (typeof src === 'string') {
        src = { font: src };
    }
    const glyphs = Glyphs.fromFont(src);
    src.glyphs = glyphs;
    return new Canvas(src);
}
