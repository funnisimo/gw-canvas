import { Canvas, Canvas2D, NotSupportedError } from "./canvas";
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
    let canvas;
    try {
        canvas = new Canvas(opts);
    }
    catch (e) {
        if (!(e instanceof NotSupportedError))
            throw e;
    }
    if (!canvas) {
        canvas = new Canvas2D(opts);
    }
    return canvas;
}
function withFont(src) {
    if (typeof src === 'string') {
        src = { font: src };
    }
    src.glyphs = Glyphs.fromFont(src);
    let canvas;
    try {
        canvas = new Canvas(src);
    }
    catch (e) {
        if (!(e instanceof NotSupportedError))
            throw e;
    }
    if (!canvas) {
        canvas = new Canvas2D(src);
    }
    return canvas;
}
export { Canvas, Canvas2D, Glyphs, Buffer, DataBuffer, Color, Mixer, withImage, withFont, configure, NotSupportedError, };
