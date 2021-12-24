import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { DataBuffer } from "./buffer";
declare type GL = WebGL2RenderingContext;
export interface Options {
    width?: number;
    height?: number;
    glyphs: Glyphs;
    div?: HTMLElement | string;
    render?: boolean;
}
export declare class NotSupportedError extends Error {
    constructor(...params: any[]);
}
export declare abstract class BaseCanvas {
    protected _renderRequested: boolean;
    protected _glyphs: Glyphs;
    protected _autoRender: boolean;
    protected _node: HTMLCanvasElement;
    protected _width: number;
    protected _height: number;
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
    protected _createNode(): HTMLCanvasElement;
    protected abstract _createContext(): void;
    private _configure;
    protected _setGlyphs(glyphs: Glyphs): boolean;
    resize(width: number, height: number): void;
    protected _requestRender(): void;
    protected abstract draw(x: number, y: number, glyph: number, fg: number, bg: number): boolean;
    abstract copy(buffer: DataBuffer): void;
    abstract copyTo(buffer: DataBuffer): void;
    abstract render(): void;
    hasXY(x: number, y: number): boolean;
    toX(x: number): number;
    toY(y: number): number;
}
export declare class Canvas extends BaseCanvas {
    private _gl;
    private _buffers;
    protected _data: {
        fg: Uint16Array;
        bg: Uint16Array;
        glyph: Uint8Array;
    };
    private _attribs;
    private _uniforms;
    private _texture;
    constructor(options: Options);
    protected _createContext(): void;
    private _createGeometry;
    private _createData;
    protected _setGlyphs(glyphs: Glyphs): boolean;
    _uploadGlyphs(): void;
    resize(width: number, height: number): void;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): boolean;
    copy(buffer: DataBuffer): void;
    copyTo(buffer: DataBuffer): void;
    render(): void;
}
export declare class Canvas2D extends BaseCanvas {
    private _ctx;
    private _changed;
    protected _data: Uint32Array;
    constructor(options: Options);
    protected _createContext(): void;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): boolean;
    copyTo(buffer: DataBuffer): void;
    resize(width: number, height: number): void;
    copy(buffer: DataBuffer): void;
    render(): void;
    protected _renderCell(index: number): void;
}
export interface ImageOptions extends Options {
    image: HTMLImageElement | string;
}
export declare type FontOptions = Options & GlyphOptions;
export declare function withImage(image: ImageOptions | HTMLImageElement | string): Canvas | Canvas2D;
export declare function withFont(src: FontOptions | string): Canvas | Canvas2D;
export declare function createProgram(gl: GL, ...sources: string[]): WebGLProgram;
export declare function createTexture(gl: GL): WebGLTexture;
export declare const QUAD: number[];
export declare function createGeometry(gl: GL, attribs: Record<string, number>, width: number, height: number): {
    position: WebGLBuffer | null;
    uv: WebGLBuffer | null;
};
export {};
