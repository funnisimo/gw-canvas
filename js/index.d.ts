import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';
interface ImageOptions {
    image?: HTMLImageElement | string;
}
declare type Options = CanvasOptions & GlyphOptions & ImageOptions;
declare function withImage(image: Options | HTMLImageElement | string): Canvas;
declare function withFont(src: Options | string): Canvas;
export { Canvas, Glyphs, Buffer, withImage, withFont, };
