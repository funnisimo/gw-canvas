import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';
interface ImageOptions extends CanvasOptions {
    image: HTMLImageElement | string;
}
declare type FontOptions = CanvasOptions & GlyphOptions;
declare function withImage(image: ImageOptions | HTMLImageElement | string): Canvas;
declare function withFont(src: FontOptions | string): Canvas;
export { Canvas, Glyphs, Buffer, withImage, withFont, };
