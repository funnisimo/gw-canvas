import { Color } from './color';
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
    draw(info: DrawInfo, opacity?: number): this | undefined;
    swapColors(): this;
}
