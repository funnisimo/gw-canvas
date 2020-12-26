import { Color, ColorBase } from "./color";
import { DrawInfo } from "./buffer";

export interface SpriteConfig {
  ch?: string;
  fg?: Color | number | string | null;
  bg?: Color | number | string | null;
  opacity?: number;
}

export class Sprite implements DrawInfo {
  public ch?: string | null;
  public glyph?: number;
  public fg: number | Color;
  public bg: number | Color;
  public opacity?: number;
  public name?: string;

  static make(): Sprite;
  static make(
    ch: string | null,
    fg: Color | number | string | number[] | null,
    bg: Color | number | string | number[] | null,
    opacity?: number
  ): Sprite;
  static make(args: any[]): Sprite;
  static make(info: Partial<SpriteConfig>): Sprite;
  static make(...args: any[]) {
    let ch = null,
      fg: ColorBase | null = -1,
      bg: ColorBase | null = -1,
      opacity;

    if (args.length == 0) {
      return new Sprite(null, -1, -1);
    } else if (args.length == 1 && Array.isArray(args[0])) {
      args = args[0];
    }
    if (args.length > 1) {
      ch = args[0] || null;
      fg = args[1];
      bg = args[2];
      opacity = args[3];
    } else if (args.length == 1) {
      if (typeof args[0] === "string") {
        bg = args[0];
      } else {
        const sprite = args[0] as SpriteConfig;
        ch = sprite.ch || null;
        fg = sprite.fg || -1;
        bg = sprite.bg || -1;
        opacity = sprite.opacity;
      }
    }
    if (typeof fg === "string") fg = Color.from(fg);
    else if (Array.isArray(fg)) fg = Color.make(fg);
    else if (fg === undefined || fg === null) fg = -1;

    if (typeof bg === "string") bg = Color.from(bg);
    else if (Array.isArray(bg)) bg = Color.make(bg);
    else if (bg === undefined || bg === null) bg = -1;

    return new this(ch, fg, bg, opacity);
  }

  static install(
    name: string,
    ch: string | null,
    fg: Color | number | string | number[] | null,
    bg: Color | number | string | number[] | null,
    opacity?: number
  ): Sprite;
  static install(name: string, args: any[]): Sprite;
  static install(name: string, info: Partial<SpriteConfig>): Sprite;
  static install(name: string, ...args: any[]) {
    let sprite;
    // @ts-ignore
    sprite = this.make(...args);
    sprite.name = name;
    sprites[name] = sprite;
    return sprite;
  }

  constructor(
    ch: string | null,
    fg: Color | number,
    bg: Color | number,
    opacity?: number
  ) {
    this.ch = ch;
    this.fg = fg;
    this.bg = bg;
    this.opacity = opacity;
  }
}

export const sprites: Record<string, Sprite> = {};
