import { Layer } from "./layer";
import * as Color from "./color";
import { Mixer } from "./mixer";
export interface DrawInfo {
    ch?: string | null;
    glyph?: number;
    fg: Color.Color | number;
    bg: Color.Color | number;
}
export declare class DataBuffer {
    _data: Mixer[];
    _width: number;
    _height: number;
    constructor(width: number, height: number);
    get width(): number;
    get height(): number;
    get(x: number, y: number): Mixer;
    _toGlyph(ch: string): number;
    draw(x: number, y: number, glyph?: number | string, fg?: Color.ColorBase, bg?: Color.ColorBase): this;
    drawSprite(x: number, y: number, sprite: DrawInfo): this;
    blackOut(x: number, y: number): this;
    fill(glyph?: number | string, fg?: number, bg?: number): this;
    copy(other: DataBuffer): this;
}
export declare class Buffer extends DataBuffer {
    private _layer;
    constructor(layer: Layer);
    _toGlyph(ch: string): number;
    render(): this;
    copyFromCanvas(): this;
}
