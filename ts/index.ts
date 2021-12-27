import {
  Canvas,
  ImageOptions,
  FontOptions,
  NotSupportedError,
  withImage,
  withFont,
} from "./canvas";
import { Glyphs } from "./glyphs";
import { Buffer, DataBuffer } from "./buffer";
import { Mixer } from "./mixer";
import { configure } from "./config";
import { Sprite, SpriteConfig } from "./sprite";
export * from "./layer";

export {
  Canvas,
  ImageOptions,
  FontOptions,
  Glyphs,
  Buffer,
  DataBuffer,
  Mixer,
  Sprite,
  SpriteConfig,
  withImage,
  withFont,
  configure,
  NotSupportedError,
};

export * as color from "./color";
