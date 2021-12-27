import { Canvas } from "./canvas";
import { DataBuffer } from "./buffer";
import * as Color from "./color";
export declare class Layer {
    fg: Uint16Array;
    bg: Uint16Array;
    _depth: number;
    glyph: Uint8Array;
    canvas: Canvas;
    constructor(canvas: Canvas, depth?: number);
    get width(): number;
    get height(): number;
    get depth(): number;
    draw(x: number, y: number, glyph: string | number, fg?: number | Color.ColorData, bg?: number | Color.ColorData): void;
    set(index: number, glyph: number, fg: number, bg: number): void;
    copy(buffer: DataBuffer): void;
    copyTo(buffer: DataBuffer): void;
}
