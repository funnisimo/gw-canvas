import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';
declare type Options = CanvasOptions & GlyphOptions;
declare function withImage(image: Options | HTMLImageElement | string): Canvas;
declare function withFont(src: Options | string): Canvas;
export declare var canvas: {
    Canvas: typeof Canvas;
    Glyphs: typeof Glyphs;
    Buffer: typeof Buffer;
    withImage: typeof withImage;
    withFont: typeof withFont;
};
export {};
