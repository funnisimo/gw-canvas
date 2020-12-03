import { Canvas, Options as CanvasOptions } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer } from './buffer';
import { Color } from './color';
import { Mixer } from './mixer';
import { configure } from './config';


interface ImageOptions extends CanvasOptions {
  image: HTMLImageElement|string;
}

type FontOptions = CanvasOptions & GlyphOptions;


function withImage(image: ImageOptions|HTMLImageElement|string) {
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


function withFont(src: FontOptions|string) {
  if (typeof src === 'string') {
    src = { font: src } as FontOptions;
  }
  src.glyphs = Glyphs.fromFont(src);
  return new Canvas(src);
}

export { 
  Canvas, 
  Glyphs, 
  Buffer,
  Color,
  Mixer,
  withImage,
  withFont,
  configure,
};
