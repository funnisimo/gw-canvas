import { Color } from "./color";
import { DrawInfo } from "./buffer";
export interface SpriteConfig {
    ch?: string;
    fg?: Color | number | string | null;
    bg?: Color | number | string | null;
    opacity?: number;
}
export declare class Sprite implements DrawInfo {
    ch?: string | null;
    glyph?: number;
    fg: number | Color;
    bg: number | Color;
    opacity?: number;
    name?: string;
    static make(): Sprite;
    static make(ch: string | null, fg: Color | number | string | number[] | null, bg: Color | number | string | number[] | null, opacity?: number): Sprite;
    static make(args: any[]): Sprite;
    static make(info: Partial<SpriteConfig>): Sprite;
    static install(name: string, ch: string | null, fg: Color | number | string | number[] | null, bg: Color | number | string | number[] | null, opacity?: number): Sprite;
    static install(name: string, args: any[]): Sprite;
    static install(name: string, info: Partial<SpriteConfig>): Sprite;
    constructor(ch: string | null, fg: Color | number, bg: Color | number, opacity?: number);
}
export declare const sprites: Record<string, Sprite>;
