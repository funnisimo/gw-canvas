declare type ColorData = number[];
export declare type ColorBase = string | number | Color | ColorData;
export declare const colors: Record<string, Color>;
export declare class Color extends Int16Array {
    dances: boolean;
    name?: string;
    static fromArray(vals: ColorData, base256?: boolean): Color;
    static fromCss(css: string): Color;
    static fromName(name: string): Color;
    static fromNumber(val: number, base256?: boolean): Color;
    static make(arg?: ColorBase | null, base256?: boolean): Color;
    static from(): Color;
    static from(rgb: number, base256?: boolean): Color;
    static from(color?: ColorBase | null): Color;
    static from(arrayLike: ArrayLike<number>): Color;
    static install(name: string, info: ColorBase): Color;
    static installSpread(name: string, base: ColorBase): Color;
    constructor(r?: number, g?: number, b?: number, rand?: number, redRand?: number, greenRand?: number, blueRand?: number, dances?: boolean);
    get r(): number;
    private get _r();
    private set _r(value);
    get g(): number;
    private get _g();
    private set _g(value);
    get b(): number;
    private get _b();
    private set _b(value);
    private get _rand();
    private get _redRand();
    private get _greenRand();
    private get _blueRand();
    get l(): number;
    get s(): number;
    get h(): number;
    isNull(): boolean;
    equals(other: ColorBase): boolean;
    copy(other: ColorBase): this;
    protected _changed(): this;
    clone(): any;
    assign(_r?: number, _g?: number, _b?: number, _rand?: number, _redRand?: number, _greenRand?: number, _blueRand?: number, dances?: boolean): this;
    assignRGB(_r?: number, _g?: number, _b?: number, _rand?: number, _redRand?: number, _greenRand?: number, _blueRand?: number, dances?: boolean): this;
    nullify(): this;
    blackOut(): this;
    toInt(base256?: boolean): number;
    clamp(): this;
    mix(other: ColorBase, percent: number): this;
    lighten(percent: number): this | undefined;
    darken(percent: number): this | undefined;
    bake(): this;
    add(other: ColorBase, percent?: number): this;
    scale(percent: number): this;
    multiply(other: ColorData | Color): this;
    normalize(): this;
    /**
     * Returns the css code for the current RGB values of the color.
     * @param base256 - Show in base 256 (#abcdef) instead of base 16 (#abc)
     */
    css(base256?: boolean): string;
    toString(base256?: boolean): string;
    static separate(a: Color, b: Color): void;
    static swap(a: Color, b: Color): void;
    static diff(a: Color, b: Color): number;
}
export {};
