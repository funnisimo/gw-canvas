import { Canvas } from "./canvas";
import { Glyphs } from "./glyphs";
import { Buffer, DataBuffer } from './buffer';
import { Color } from './color';
import { Mixer } from './mixer';
import { configure } from './config';
function withImage(image) {
    let opts = {};
    if (typeof image === 'string') {
        opts.glyphs = Glyphs.fromImage(image);
    }
    else if (image instanceof HTMLImageElement) {
        opts.glyphs = Glyphs.fromImage(image);
    }
    else {
        if (!image.image)
            throw new Error('You must supply the image.');
        Object.assign(opts, image);
        opts.glyphs = Glyphs.fromImage(image.image);
    }
    return new Canvas(opts);
}
function withFont(src) {
    if (typeof src === 'string') {
        src = { font: src };
    }
    src.glyphs = Glyphs.fromFont(src);
    return new Canvas(src);
}
export { Canvas, Glyphs, Buffer, DataBuffer, Color, Mixer, withImage, withFont, configure, };
