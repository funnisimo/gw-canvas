import { Glyphs } from './glyphs';
import { DataBuffer } from './buffer';
export interface Options {
    width?: number;
    height?: number;
    glyphs: Glyphs;
    node?: HTMLCanvasElement | string;
    render?: boolean;
}
export declare abstract class BaseCanvas {
    protected _data: Uint32Array;
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
    protected _initNode(node?: HTMLCanvasElement | string): HTMLCanvasElement;
    protected abstract _initContext(): void;
    private _configure;
    protected _setGlyphs(glyphs: Glyphs): boolean;
    resize(width: number, height: number): void;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): void;
    protected _requestRender(): void;
    protected _set(x: number, y: number, style: number): void;
    copy(buffer: DataBuffer): void;
    copyTo(buffer: DataBuffer): void;
    abstract render(): void;
    hasXY(x: number, y: number): boolean;
    toX(x: number): number;
    toY(y: number): number;
}
export declare class Canvas extends BaseCanvas {
    private _gl;
    private _buffers;
    private _attribs;
    private _uniforms;
    private _texture;
    constructor(options: Options);
    protected _initContext(): void;
    private _createGeometry;
    private _createData;
    protected _setGlyphs(glyphs: Glyphs): boolean;
    _uploadGlyphs(): void;
    resize(width: number, height: number): void;
    protected _set(x: number, y: number, style: number): void;
    copy(buffer: DataBuffer): void;
    copyTo(buffer: DataBuffer): void;
    render(): void;
}
