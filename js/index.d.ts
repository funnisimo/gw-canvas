import { Canvas, Options as CanvasOptions } from "./canvas.js";
import { Glyphs, Options as GlyphOptions } from "./glyphs.js";
interface ImageOptions {
    image?: HTMLImageElement | string;
}
declare type Options = CanvasOptions & GlyphOptions & ImageOptions;
export { Canvas, Glyphs, Options };
export declare function withImage(image: Options | HTMLImageElement | string): Canvas;
export declare function withFont(src: Options | string): Canvas;
