import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Layer } from "./layer";
import * as Color from "./color";
declare type GL = WebGL2RenderingContext;
export declare const VERTICES_PER_TILE = 6;
export interface Options {
    width?: number;
    height?: number;
    glyphs: Glyphs;
    div?: HTMLElement | string;
    render?: boolean;
    bg?: Color.ColorBase;
}
export declare class NotSupportedError extends Error {
    constructor(...params: any[]);
}
export declare class Canvas {
    _renderRequested: boolean;
    _glyphs: Glyphs;
    _autoRender: boolean;
    _node: HTMLCanvasElement;
    _width: number;
    _height: number;
    _gl: GL;
    _buffers: {
        position?: WebGLBuffer;
        uv?: WebGLBuffer;
        fg?: WebGLBuffer;
        bg?: WebGLBuffer;
        glyph?: WebGLBuffer;
    };
    layer: Layer;
    _attribs: Record<string, number>;
    _uniforms: Record<string, WebGLUniformLocation>;
    _texture: WebGLTexture;
    bg: Color.Color;
    constructor(options: Options);
    get node(): HTMLCanvasElement;
    get width(): number;
    get height(): number;
    get tileWidth(): number;
    get tileHeight(): number;
    get pxWidth(): number;
    get pxHeight(): number;
    get glyphs(): Glyphs;
    set glyphs(glyphs: Glyphs);
    _createNode(): HTMLCanvasElement;
    _configure(options: Options): void;
    _setGlyphs(glyphs: Glyphs): boolean;
    resize(width: number, height: number): void;
    _requestRender(): void;
    hasXY(x: number, y: number): boolean;
    toX(x: number): number;
    toY(y: number): number;
    _createContext(): void;
    _createGeometry(): void;
    _createData(): void;
    _uploadGlyphs(): void;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): boolean;
    render(): void;
}
export interface ImageOptions extends Options {
    image: HTMLImageElement | string;
}
export declare type FontOptions = Options & GlyphOptions;
export declare function withImage(image: ImageOptions | HTMLImageElement | string): Canvas;
export declare function withFont(src: FontOptions | string): Canvas;
export declare function createProgram(gl: GL, ...sources: string[]): WebGLProgram;
export declare const QUAD: number[];
export {};
