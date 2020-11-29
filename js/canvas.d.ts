import { Glyphs } from './glyphs';
import { Buffer } from './buffer';
export interface Options {
    width?: number;
    height?: number;
    glyphs: Glyphs;
    node?: HTMLCanvasElement | string;
    render?: boolean;
}
export declare class Canvas {
    private _gl;
    private _data;
    private _buffers;
    private _attribs;
    private _uniforms;
    private _renderRequested;
    private _texture;
    private _glyphs;
    private _autoRender;
    private _width;
    private _height;
    constructor(options: Options);
    get node(): HTMLCanvasElement | OffscreenCanvas;
    get width(): number;
    get height(): number;
    get tileWidth(): number;
    get tileHeight(): number;
    get pxWidth(): number;
    get pxHeight(): number;
    get glyphs(): Glyphs;
    set glyphs(glyphs: Glyphs);
    private _configure;
    resize(width: number, height: number): void;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): void;
    copy(buffer: Buffer): void;
    copyTo(buffer: Buffer): void;
    private _initGL;
    private _createGeometry;
    private _createData;
    private _requestRender;
    render(): void;
    _uploadGlyphs(): void;
}
