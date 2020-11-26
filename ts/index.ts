import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';

interface ImageOptions {
  image?: HTMLImageElement|string;
}

type Options = CanvasOptions & GlyphOptions & ImageOptions;

export { Canvas, Glyphs, Options, Buffer };


export function withImage(image: Options|HTMLImageElement|string) {
  let el;
  let opts = image as Options;
  if (opts.image) {
    image = opts.image;
  }
  else {
    opts = {};
  }
  if (typeof image === 'string') {
    if (image.startsWith('data:')) {
      throw new Error('Load data into an Image element first.');
    }
    else {
      el = document.getElementById(image);
      if (!el) {
        throw new Error('Could not find element with id:' + image);
      }
    }
  }
  else if (image instanceof HTMLImageElement) {
    el = image;
  }

  opts.glyphs = Glyphs.fromImage(el as HTMLImageElement);
  return new Canvas(opts);
}


export function withFont(src: Options|string) {
  if (typeof src === 'string') {
    src = { font: src };
  }
  const glyphs = Glyphs.fromFont(src);
  src.glyphs = glyphs;
  return new Canvas(src);
}
