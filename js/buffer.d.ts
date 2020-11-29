import { Canvas } from './canvas';
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
    draw(x: number, y: number, glyph?: number | string, fg?: number, bg?: number): void;
    fill(bg?: number, glyph?: number | string, fg?: number): void;
    copy(other: Buffer): void;
    render(): void;
    copyFromCanvas(): void;
}
