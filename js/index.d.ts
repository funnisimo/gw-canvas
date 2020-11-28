import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';
declare type Options = CanvasOptions & GlyphOptions;
declare function withImage(image: Options | HTMLImageElement | string): Canvas;
declare function withFont(src: Options | string): Canvas;
export { Canvas, Glyphs, Buffer, withImage, withFont, };
