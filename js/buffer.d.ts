export declare class Buffer {
    private _data;
    private _width;
    constructor(width: number, height: number);
    get data(): Uint32Array;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): void;
    fill(glyph?: number, fg?: number, bg?: number): void;
    copy(other: Buffer): void;
}
