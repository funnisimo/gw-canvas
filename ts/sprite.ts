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

function clamp(v: number, n: number, x: number): number {
  return Math.min(x, Math.max(n, v));
}

export class Sprite implements SpriteData {
  public ch: string | null;
  public fg: Color.Color;
  public bg: Color.Color;
  public opacity: number;
  public name?: string;

  constructor(
    ch?: string | null,
    fg?: Color.ColorBase | null,
    bg?: Color.ColorBase | null,
    opacity = 100
  ) {
    if (!ch) ch = null;
    this.ch = ch;
    this.fg = Color.from(fg);
    this.bg = Color.from(bg);
    this.opacity = clamp(opacity, 0, 100);
  }

  clone() {
    return new Sprite(this.ch, this.fg, this.bg, this.opacity);
  }

  toString() {
    const parts = [];
    if (this.ch) parts.push("ch: " + this.ch);
    if (!this.fg.isNull()) parts.push("fg: " + this.fg.toString());
    if (!this.bg.isNull()) parts.push("bg: " + this.bg.toString());
    if (this.opacity !== 100) parts.push("opacity: " + this.opacity);

    return "{ " + parts.join(", ") + " }";
  }
}

export const sprites: Record<string, Sprite> = {};

export function make(): Sprite;
export function make(bg: Color.ColorBase, opacity?: number): Sprite;
export function make(
  ch?: string | null,
  fg?: Color.ColorBase | null,
  bg?: Color.ColorBase | null,
  opacity?: number
): Sprite;
export function make(args: any[]): Sprite;
export function make(info: SpriteConfig): Sprite;
export function make(...args: any[]) {
  let ch = null,
    fg: Color.ColorBase | null = -1,
    bg: Color.ColorBase | null = -1,
    opacity;

  if (args.length == 0) {
    return new Sprite(null, -1, -1);
  } else if (args.length == 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  if (args.length > 3) {
    opacity = args[3];
    args.pop();
  } else if (
    args.length == 2 &&
    typeof args[1] == "number" &&
    args[0].length > 1
  ) {
    opacity = args.pop();
  }
  if (args.length > 1) {
    ch = args[0] || null;
    fg = args[1];
    bg = args[2];
  } else {
    if (typeof args[0] === "string" && args[0].length == 1) {
      ch = args[0];
      fg = "white"; // white is default?
    } else if (
      (typeof args[0] === "string" && args[0].length > 1) ||
      typeof args[0] === "number"
    ) {
      bg = args[0];
    } else if (args[0] instanceof Color.Color) {
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

  return new Sprite(ch, fg, bg, opacity);
}

export function from(name: string): Sprite;
export function from(config: SpriteConfig): Sprite;
export function from(config: string | SpriteConfig): Sprite {
  if (typeof config === "string") {
    const sprite = sprites[config];
    if (!sprite) throw new Error("Failed to find sprite: " + config);
    return sprite;
  }
  return make(config);
}

export function install(
  name: string,
  bg: Color.ColorBase,
  opacity?: number
): Sprite;
export function install(
  name: string,
  ch: string | null,
  fg: Color.Color | number | string | number[] | null,
  bg: Color.Color | number | string | number[] | null,
  opacity?: number
): Sprite;
export function install(name: string, args: any[]): Sprite;
export function install(name: string, info: SpriteConfig): Sprite;
export function install(name: string, ...args: any[]) {
  let sprite;
  // @ts-ignore
  sprite = make(...args);
  sprite.name = name;
  sprites[name] = sprite;
  return sprite;
}
