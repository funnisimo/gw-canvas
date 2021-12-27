import * as Color from "./color";
export interface SpriteConfig {
    ch?: string;
    fg?: Color.Color | number | string | null;
    bg?: Color.Color | number | string | null;
    opacity?: number;
}
export interface SpriteData {
    readonly ch: string | null;
    readonly fg: Color.ColorBase;
    readonly bg: Color.ColorBase;
    readonly opacity?: number;
}
export declare class Sprite implements SpriteData {
    ch: string | null;
    fg: Color.Color;
    bg: Color.Color;
    opacity: number;
    name?: string;
    constructor(ch?: string | null, fg?: Color.ColorBase | null, bg?: Color.ColorBase | null, opacity?: number);
    clone(): Sprite;
    toString(): string;
}
export declare const sprites: Record<string, Sprite>;
export declare function make(): Sprite;
export declare function make(bg: Color.ColorBase, opacity?: number): Sprite;
export declare function make(ch?: string | null, fg?: Color.ColorBase | null, bg?: Color.ColorBase | null, opacity?: number): Sprite;
export declare function make(args: any[]): Sprite;
export declare function make(info: SpriteConfig): Sprite;
export declare function from(name: string): Sprite;
export declare function from(config: SpriteConfig): Sprite;
export declare function install(name: string, bg: Color.ColorBase, opacity?: number): Sprite;
export declare function install(name: string, ch: string | null, fg: Color.Color | number | string | number[] | null, bg: Color.Color | number | string | number[] | null, opacity?: number): Sprite;
export declare function install(name: string, args: any[]): Sprite;
export declare function install(name: string, info: SpriteConfig): Sprite;
