import { Color } from './color';
export interface SpriteInfo {
    ch?: string | number;
    fg?: Color;
    bg?: Color;
}
export declare class Sprite {
    ch: string | number;
    fg: Color;
    bg: Color;
    constructor();
    copy(other: Sprite): this;
    clone(): Sprite;
    clear(): this;
    draw(sprite: SpriteInfo, opacity?: number): this | undefined;
    swapColors(): this;
}
