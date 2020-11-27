import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';
declare type Options = CanvasOptions & GlyphOptions;
export { Canvas, Glyphs, Options, Buffer };
export declare function withImage(image: Options | HTMLImageElement | string): Canvas;
export declare function withFont(src: Options | string): Canvas;
