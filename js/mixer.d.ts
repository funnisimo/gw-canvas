import { Color, ColorBase } from './color';
import { DrawInfo } from './buffer';
export declare class Mixer {
    ch: string | number;
    fg: Color;
    bg: Color;
    constructor();
    copy(other: Mixer): this;
    clone(): Mixer;
    nullify(): this;
    blackOut(): this;
    draw(ch?: string | number, fg?: ColorBase, bg?: ColorBase): this;
    drawSprite(info: DrawInfo, opacity?: number): this | undefined;
    invert(): this;
    multiply(color: ColorBase, fg?: boolean, bg?: boolean): this;
    mix(color: ColorBase, fg?: number, bg?: number): this;
    add(color: ColorBase, fg?: number, bg?: number): this;
    separate(): this;
    bake(): {
        ch: string | number;
        fg: number;
        bg: number;
    };
}
