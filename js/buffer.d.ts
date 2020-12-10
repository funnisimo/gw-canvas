import { Canvas } from './canvas';
import { Color } from './color';
export interface DrawInfo {
    ch?: string;
    glyph?: number;
    fg: Color | number;
    bg: Color | number;
}
export declare class DataBuffer {
    private _data;
    private _width;
    private _height;
    constructor(width: number, height: number);
    get data(): Uint32Array;
    get width(): number;
    get height(): number;
    get(x: number, y: number): {
        glyph: number;
        fg: number;
        bg: number;
    };
    protected _toGlyph(ch: string): number;
    draw(x: number, y: number, glyph?: number | string, fg?: Color | number, bg?: Color | number): this;
    drawSprite(x: number, y: number, sprite: DrawInfo): this;
    blackOut(x: number, y: number): this;
    fill(glyph?: number | string, fg?: number, bg?: number): this;
    copy(other: DataBuffer): this;
}
export declare class Buffer extends DataBuffer {
    private _canvas;
    constructor(canvas: Canvas);
    _toGlyph(ch: string): number;
    render(): this;
    copyFromCanvas(): this;
}
