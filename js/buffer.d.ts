import { Canvas } from './canvas';
import { Color } from './color';
export interface DrawInfo {
    ch?: string;
    glyph?: number;
    fg: Color | number;
    bg: Color | number;
}
export declare class Buffer {
    private _data;
    private _canvas;
    constructor(canvas: Canvas);
    get data(): Uint32Array;
    get width(): number;
    get height(): number;
    get(x: number, y: number): {
        glyph: number;
        fg: number;
        bg: number;
    };
    draw(x: number, y: number, glyph?: number | string, fg?: Color | number, bg?: Color | number): this;
    drawSprite(x: number, y: number, sprite: DrawInfo): this;
    blackOut(x: number, y: number): this;
    fill(glyph?: number | string, fg?: number, bg?: number): this;
    copy(other: Buffer): this;
    render(): this;
    copyFromCanvas(): this;
}
