import { Canvas } from "./canvas";
import { DataBuffer } from "./buffer";
import * as Color from "./color";
export declare class Layer {
    canvas: Canvas;
    fg: Uint16Array;
    bg: Uint16Array;
    glyph: Uint8Array;
    _depth: number;
    _empty: boolean;
    constructor(canvas: Canvas, depth?: number);
    get width(): number;
    get height(): number;
    get depth(): number;
    get empty(): boolean;
    detach(): void;
    resize(width: number, height: number): void;
    clear(): void;
    draw(x: number, y: number, glyph: string | number, fg?: number | Color.ColorData, bg?: number | Color.ColorData): void;
    set(index: number, glyph: number, fg: number, bg: number): void;
    copy(buffer: DataBuffer): void;
    copyTo(buffer: DataBuffer): void;
}
