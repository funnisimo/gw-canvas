declare type CTX = CanvasRenderingContext2D;
declare type DrawFunction = (ctx: CTX, x: number, y: number, width: number, height: number) => void;
declare type DrawType = string | DrawFunction;
interface Options$1 {
    font?: string;
    fontSize?: number;
    size?: number;
    tileWidth?: number;
    tileHeight?: number;
    basicOnly?: boolean;
    basic?: boolean;
}
declare class Glyphs {
    private _node;
    private _ctx;
    private _tileWidth;
    private _tileHeight;
    needsUpdate: boolean;
    private _map;
    static fromImage(src: string | HTMLImageElement): Glyphs;
    static fromFont(src: Options$1 | string): Glyphs;
    private constructor();
    get node(): HTMLCanvasElement;
    get ctx(): CanvasRenderingContext2D;
    get tileWidth(): number;
    get tileHeight(): number;
    get pxWidth(): number;
    get pxHeight(): number;
    forChar(ch: string): number;
    private _configure;
    draw(n: number, ch: DrawType): void;
    _initGlyphs(basicOnly?: boolean): void;
}

declare type ColorData = [number, number, number] | [number, number, number, number];
declare type ColorBase = string | number | ColorData | Color;
declare type LightValue = [number, number, number];
declare const colors: Record<string, Color>;
declare class Color {
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
declare function fromArray(vals: ColorData, base256?: boolean): Color;
declare function fromCss(css: string): Color;
declare function fromName(name: string): Color;
declare function fromNumber(val: number, base256?: boolean): Color;
declare function make(): Color;
declare function make(rgb: number, base256?: boolean): Color;
declare function make(color?: ColorBase | null): Color;
declare function make(arrayLike: ColorData, base256?: boolean): Color;
declare function make(...rgb: number[]): Color;
declare function from(): Color;
declare function from(rgb: number, base256?: boolean): Color;
declare function from(color?: ColorBase | null): Color;
declare function from(arrayLike: ColorData, base256?: boolean): Color;
declare function from(...rgb: number[]): Color;
declare function separate(a: Color, b: Color): [Color, Color];
declare function relativeLuminance(a: Color, b: Color): number;
declare function distance(a: Color, b: Color): number;
declare function smoothScalar(rgb: number, maxRgb?: number): number;
declare function install(name: string, info: ColorBase): Color;
declare function install(name: string, ...rgb: ColorData): Color;
declare function installSpread(name: string, info: ColorBase): Color;
declare function installSpread(name: string, ...rgb: ColorData): Color;
declare const NONE: Color;
declare const BLACK: Color;
declare const WHITE: Color;

type color_d_ColorData = ColorData;
type color_d_ColorBase = ColorBase;
type color_d_LightValue = LightValue;
declare const color_d_colors: typeof colors;
type color_d_Color = Color;
declare const color_d_Color: typeof Color;
declare const color_d_fromArray: typeof fromArray;
declare const color_d_fromCss: typeof fromCss;
declare const color_d_fromName: typeof fromName;
declare const color_d_fromNumber: typeof fromNumber;
declare const color_d_make: typeof make;
declare const color_d_from: typeof from;
declare const color_d_separate: typeof separate;
declare const color_d_relativeLuminance: typeof relativeLuminance;
declare const color_d_distance: typeof distance;
declare const color_d_smoothScalar: typeof smoothScalar;
declare const color_d_install: typeof install;
declare const color_d_installSpread: typeof installSpread;
declare const color_d_NONE: typeof NONE;
declare const color_d_BLACK: typeof BLACK;
declare const color_d_WHITE: typeof WHITE;
declare namespace color_d {
  export {
    color_d_ColorData as ColorData,
    color_d_ColorBase as ColorBase,
    color_d_LightValue as LightValue,
    color_d_colors as colors,
    color_d_Color as Color,
    color_d_fromArray as fromArray,
    color_d_fromCss as fromCss,
    color_d_fromName as fromName,
    color_d_fromNumber as fromNumber,
    color_d_make as make,
    color_d_from as from,
    color_d_separate as separate,
    color_d_relativeLuminance as relativeLuminance,
    color_d_distance as distance,
    color_d_smoothScalar as smoothScalar,
    color_d_install as install,
    color_d_installSpread as installSpread,
    color_d_NONE as NONE,
    color_d_BLACK as BLACK,
    color_d_WHITE as WHITE,
  };
}

interface SpriteConfig {
    ch?: string;
    fg?: Color | number | string | null;
    bg?: Color | number | string | null;
    opacity?: number;
}
interface SpriteData {
    readonly ch: string | null;
    readonly fg: ColorBase;
    readonly bg: ColorBase;
    readonly opacity?: number;
}
declare class Sprite implements SpriteData {
    ch: string | null;
    fg: Color;
    bg: Color;
    opacity: number;
    name?: string;
    constructor(ch?: string | null, fg?: ColorBase | null, bg?: ColorBase | null, opacity?: number);
    clone(): Sprite;
    toString(): string;
}

interface DrawInfo$1 {
    ch: string | number | null;
    fg: ColorBase;
    bg: ColorBase;
}
declare class Mixer implements DrawInfo$1 {
    ch: string | number;
    fg: Color;
    bg: Color;
    constructor(base?: Partial<DrawInfo$1>);
    protected _changed(): this;
    copy(other: Partial<DrawInfo$1>): this;
    clone(): Mixer;
    equals(other: Mixer): boolean;
    nullify(): this;
    blackOut(): this;
    draw(ch?: string | number, fg?: ColorBase, bg?: ColorBase): this;
    drawSprite(src: SpriteData | Mixer, opacity?: number): this | undefined;
    invert(): this;
    multiply(color: ColorBase, fg?: boolean, bg?: boolean): this;
    scale(multiplier: number, fg?: boolean, bg?: boolean): this;
    mix(color: ColorBase, fg?: number, bg?: number): this;
    add(color: ColorBase, fg?: number, bg?: number): this;
    separate(): this;
    bake(clearDancing?: boolean): {
        ch: string | number;
        fg: number;
        bg: number;
    };
    toString(): string;
}

interface DrawInfo {
    ch?: string | null;
    glyph?: number;
    fg: Color | number;
    bg: Color | number;
}
declare class DataBuffer {
    _data: Mixer[];
    _width: number;
    _height: number;
    constructor(width: number, height: number);
    get width(): number;
    get height(): number;
    resize(width: number, height: number): void;
    get(x: number, y: number): Mixer;
    _toGlyph(ch: string): number;
    draw(x: number, y: number, glyph?: number | string, fg?: ColorBase, bg?: ColorBase): this;
    drawSprite(x: number, y: number, sprite: DrawInfo): this;
    blackOut(x: number, y: number): this;
    fill(glyph?: number | string, fg?: number, bg?: number): this;
    copy(other: DataBuffer): this;
}
declare class Buffer extends DataBuffer {
    private _layer;
    constructor(layer: Layer);
    _toGlyph(ch: string): number;
    render(): this;
    copyFromCanvas(): this;
}

declare class Layer {
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
    draw(x: number, y: number, glyph: string | number, fg?: number | ColorData, bg?: number | ColorData): void;
    set(index: number, glyph: number, fg: number, bg: number): void;
    copy(buffer: DataBuffer): void;
    copyTo(buffer: DataBuffer): void;
}

declare type GL = WebGL2RenderingContext;
interface Options {
    width?: number;
    height?: number;
    glyphs: Glyphs;
    div?: HTMLElement | string;
    render?: boolean;
    bg?: ColorBase;
}
declare class NotSupportedError extends Error {
    constructor(...params: any[]);
}
declare class Canvas {
    _renderRequested: boolean;
    _glyphs: Glyphs;
    _autoRender: boolean;
    _node: HTMLCanvasElement;
    _width: number;
    _height: number;
    _gl: GL;
    _buffers: {
        position?: WebGLBuffer;
        uv?: WebGLBuffer;
        fg?: WebGLBuffer;
        bg?: WebGLBuffer;
        glyph?: WebGLBuffer;
    };
    layer: Layer;
    _attribs: Record<string, number>;
    _uniforms: Record<string, WebGLUniformLocation>;
    _texture: WebGLTexture;
    bg: Color;
    constructor(options: Options);
    get node(): HTMLCanvasElement;
    get width(): number;
    get height(): number;
    get tileWidth(): number;
    get tileHeight(): number;
    get pxWidth(): number;
    get pxHeight(): number;
    get glyphs(): Glyphs;
    set glyphs(glyphs: Glyphs);
    _createNode(): HTMLCanvasElement;
    _configure(options: Options): void;
    _setGlyphs(glyphs: Glyphs): boolean;
    resize(width: number, height: number): void;
    _requestRender(): void;
    hasXY(x: number, y: number): boolean;
    toX(x: number): number;
    toY(y: number): number;
    _createContext(): void;
    _createGeometry(): void;
    _createData(): void;
    _uploadGlyphs(): void;
    draw(x: number, y: number, glyph: number, fg: number, bg: number): boolean;
    render(): void;
}
interface ImageOptions extends Options {
    image: HTMLImageElement | string;
}
declare type FontOptions = Options & Options$1;
declare function withImage(image: ImageOptions | HTMLImageElement | string): Canvas;
declare function withFont(src: FontOptions | string): Canvas;

declare function configure(opts?: {}): void;

export { Buffer, Canvas, DataBuffer, FontOptions, Glyphs, ImageOptions, Layer, Mixer, NotSupportedError, Sprite, SpriteConfig, color_d as color, configure, withFont, withImage };
