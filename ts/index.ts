import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';

type Options = CanvasOptions & GlyphOptions;


function withImage(image: Options|HTMLImageElement|string) {
  let opts = {} as CanvasOptions;
  if (typeof image === 'string') {
    opts.glyphs = Glyphs.fromImage(image);
  }
  else if (image instanceof HTMLImageElement) {
    opts.glyphs = Glyphs.fromImage(image);
  }
  else {
    if (!image.image) throw new Error('You must supply the image.');
    Object.assign(opts, image);
    opts.glyphs = Glyphs.fromImage(image.image);
  }

  return new Canvas(opts);
}


function withFont(src: Options|string) {
  if (typeof src === 'string') {
    src = { font: src } as Options;
  }
  src.glyphs = Glyphs.fromFont(src);
  return new Canvas(src);
}

export { 
  Canvas, 
  Glyphs, 
  Buffer,
  withImage,
  withFont,
};
