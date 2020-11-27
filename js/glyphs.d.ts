declare type CTX = CanvasRenderingContext2D;
declare type DrawFunction = (ctx: CTX, x: number, y: number, width: number, height: number) => void;
declare type DrawType = string | DrawFunction;
export interface Options {
    font?: string;
    image?: HTMLImageElement | string;
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
    static fromFont(src: Options | string): Glyphs;
    constructor(opts?: Partial<Options>);
    get tileWidth(): number;
    get tileHeight(): number;
    get pxWidth(): number;
    get pxHeight(): number;
    forChar(ch: string): number;
    private _configure;
    draw(n: number, ch: DrawType): void;
    _initGlyphs(basicOnly?: boolean): void;
}
export {};
