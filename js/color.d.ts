export declare type ColorData = [number, number, number] | [number, number, number, number];
export declare type ColorBase = string | number | ColorData | Color;
export declare type LightValue = [number, number, number];
export declare const colors: Record<string, Color>;
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    name?: string;
    constructor(r?: number, g?: number, b?: number, a?: number);
    rgb(): [number, number, number];
    rgba(): [number, number, number, number];
    isNull(): boolean;
    alpha(v: number): Color;
    get l(): number;
    get s(): number;
    get h(): number;
    equals(other: Color | ColorBase): boolean;
    toInt(): number;
    toLight(): LightValue;
    clamp(): Color;
    blend(other: ColorBase): Color;
    mix(other: ColorBase, percent: number): Color;
    lighten(percent: number): Color;
    darken(percent: number): Color;
    bake(_clearDancing?: boolean): Color;
    add(other: ColorBase, percent?: number): Color;
    scale(percent: number): Color;
    multiply(other: ColorData | Color): Color;
    normalize(): Color;
    /**
     * Returns the css code for the current RGB values of the color.
     * @param base256 - Show in base 256 (#abcdef) instead of base 16 (#abc)
     */
    css(): string;
    toString(): string;
}
export declare function fromArray(vals: ColorData, base256?: boolean): Color;
export declare function fromCss(css: string): Color;
export declare function fromName(name: string): Color;
export declare function fromNumber(val: number, base256?: boolean): Color;
export declare function make(): Color;
export declare function make(rgb: number, base256?: boolean): Color;
export declare function make(color?: ColorBase | null): Color;
export declare function make(arrayLike: ColorData, base256?: boolean): Color;
export declare function make(...rgb: number[]): Color;
export declare function from(): Color;
export declare function from(rgb: number, base256?: boolean): Color;
export declare function from(color?: ColorBase | null): Color;
export declare function from(arrayLike: ColorData, base256?: boolean): Color;
export declare function from(...rgb: number[]): Color;
export declare function separate(a: Color, b: Color): [Color, Color];
export declare function relativeLuminance(a: Color, b: Color): number;
export declare function distance(a: Color, b: Color): number;
export declare function smoothScalar(rgb: number, maxRgb?: number): number;
export declare function install(name: string, info: ColorBase): Color;
export declare function install(name: string, ...rgb: ColorData): Color;
export declare function installSpread(name: string, info: ColorBase): Color;
export declare function installSpread(name: string, ...rgb: ColorData): Color;
export declare const NONE: Color;
export declare const BLACK: Color;
export declare const WHITE: Color;
