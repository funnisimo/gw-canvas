declare type CTX = CanvasRenderingContext2D;
declare type DrawFunction = (ctx: CTX, x: number, y: number, width: number, height: number) => void;
declare type DrawType = string | DrawFunction;
export interface Options {
    font?: string;
    fontSize?: number;
    size?: number;
    tileWidth?: number;
    tileHeight?: number;
    basicOnly?: boolean;
    basic?: boolean;
}
export declare class Glyphs {
    node: HTMLCanvasElement;
    private _ctx;
    private _tileWidth;
    private _tileHeight;
    needsUpdate: boolean;
    private _map;
    static fromImage(src: string | HTMLImageElement): Glyphs;
    static forFont(src: Options | string): Glyphs;
    constructor(opts?: Partial<Options>);
    get width(): number;
    get height(): number;
    get tileWidth(): number;
    get tileHeight(): number;
    get pxWidth(): number;
    get pxHeight(): number;
    toIndex(ch: string): number;
    private _configure;
    draw(n: number, ch: DrawType): void;
    _initGlyphs(basicOnly?: boolean): void;
}
export {};
