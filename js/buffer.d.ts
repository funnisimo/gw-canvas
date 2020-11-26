import { Canvas } from './canvas';
export declare class Buffer {
    private _data;
    private _canvas;
    constructor(canvas: Canvas);
    get data(): Uint32Array;
    get width(): number;
    get height(): number;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): void;
    drawChar(x: number, y: number, ch: string, fg: number, bg: number): void;
    fill(glyph?: number, fg?: number, bg?: number): void;
    copy(other: Buffer): void;
}
