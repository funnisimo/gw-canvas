import { Canvas } from './canvas';
import { Color } from './color';
export interface DrawInfo {
    ch?: string | number;
    fg?: Color;
    bg?: Color;
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
    draw(x: number, y: number, glyph?: number | string, fg?: number, bg?: number): this;
    drawSprite(x: number, y: number, sprite: DrawInfo): this;
    blackOut(x: number, y: number): this;
    fill(bg?: number, glyph?: number | string, fg?: number): this;
    copy(other: Buffer): this;
    render(): this;
    copyFromCanvas(): this;
}
