import { Canvas, Canvas2D, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer, DataBuffer } from './buffer';
import { Color } from './color';
import { Mixer } from './mixer';
import { configure } from './config';
interface ImageOptions extends CanvasOptions {
    image: HTMLImageElement | string;
}
declare type FontOptions = CanvasOptions & GlyphOptions;
declare function withImage(image: ImageOptions | HTMLImageElement | string): Canvas | Canvas2D;
declare function withFont(src: FontOptions | string): Canvas | Canvas2D;
export { Canvas, Canvas2D, Glyphs, Buffer, DataBuffer, Color, Mixer, withImage, withFont, configure, };
