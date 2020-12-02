declare type ColorData = [number, number, number];
export declare class Color {
    r: number;
    g: number;
    b: number;
    static fromArray(vals: ColorData, base256?: boolean): Color;
    static fromString(css: string): Color;
    static fromNumber(val: number, base256?: boolean): Color;
    constructor(r?: number, g?: number, b?: number);
    equals(other: Color | ColorData): boolean;
    copy(other: Color | ColorData): this;
    clone(): Color;
    set(r?: number, g?: number, b?: number): this;
    clear(): this;
    toInt(base256?: boolean): number;
    fromInt(val: number, base256?: boolean): this;
    clamp(): this;
    mix(other: Color | ColorData, percent: number): this;
    lighten(percent: number): this;
    darken(percent: number): this;
    private _mix;
    add(other: Color | ColorData, percent?: number): this;
    scale(percent: number): this;
    multiply(other: Color | ColorData): this;
    toString(base256?: boolean): string;
}
export declare function make(arg: ColorData | string | number, base256?: boolean): Color;
export {};
