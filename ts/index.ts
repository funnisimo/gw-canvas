import { Canvas, Canvas2D, Options as CanvasOptions, NotSupportedError } from "./canvas";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Buffer, DataBuffer } from './buffer';
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

  let canvas;
  try {
    canvas = new Canvas(opts);
  }
  catch( e ) {
    if (!(e instanceof NotSupportedError)) throw e;
  }
  
  if (!canvas) {
    canvas = new Canvas2D(opts);
  }
  
  return canvas;
}


function withFont(src: FontOptions|string) {
  if (typeof src === 'string') {
    src = { font: src } as FontOptions;
  }
  src.glyphs = Glyphs.fromFont(src);
  let canvas;
  try {
    canvas = new Canvas(src);
  }
  catch( e ) {
    if (!(e instanceof NotSupportedError)) throw e;
  }
  
  if (!canvas) {
    canvas = new Canvas2D(src);
  }
  
  return canvas;
}

export { 
  Canvas, 
  Canvas2D,
  Glyphs, 
  Buffer,
  DataBuffer,
  Color,
  Mixer,
  withImage,
  withFont,
  configure,
};
