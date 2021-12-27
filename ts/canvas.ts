// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)

import * as shaders from "./shaders";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { Layer } from "./layer";
import * as Color from "./color";

type GL = WebGL2RenderingContext;
export const VERTICES_PER_TILE = 6;

export interface Options {
  width?: number;
  height?: number;
  glyphs: Glyphs;
  div?: HTMLElement | string;
  render?: boolean;
  bg?: Color.ColorBase;
}

export class NotSupportedError extends Error {
  constructor(...params: any[]) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, NotSupportedError);
    }

    this.name = "NotSupportedError";
  }
}

export class Canvas {
  _renderRequested: boolean = false;
  _glyphs!: Glyphs;
  _autoRender: boolean = true;
  _node: HTMLCanvasElement;

  _width: number = 50;
  _height: number = 25;

  _gl!: GL;
  _buffers!: {
    position?: WebGLBuffer;
    uv?: WebGLBuffer;
    fg?: WebGLBuffer;
    bg?: WebGLBuffer;
    glyph?: WebGLBuffer;
  };
  _layers: Layer[] = [];

  _attribs!: Record<string, number>;
  _uniforms!: Record<string, WebGLUniformLocation>;
  _texture!: WebGLTexture;

  bg!: Color.Color;

  constructor(options: Options) {
    if (!options.glyphs)
      throw new Error("You must supply glyphs for the canvas.");
    this._node = this._createNode();
    this._createContext();
    this._configure(options);
  }

  get node(): HTMLCanvasElement {
    return this._node;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get tileWidth() {
    return this._glyphs.tileWidth;
  }
  get tileHeight() {
    return this._glyphs.tileHeight;
  }
  get pxWidth() {
    return this.node.clientWidth;
  }
  get pxHeight() {
    return this.node.clientHeight;
  }

  get glyphs(): Glyphs {
    return this._glyphs;
  }
  set glyphs(glyphs: Glyphs) {
    this._setGlyphs(glyphs);
  }

  layer(depth = 0): Layer {
    let layer = this._layers.find((l) => l.depth === depth);
    if (layer) return layer;

    layer = new Layer(this, depth);
    this._layers.push(layer);
    this._layers.sort((a, b) => a.depth - b.depth);
    return layer;
  }

  clearLayer(depth = 0) {
    const layer = this._layers.find((l) => l.depth === depth);
    if (layer) layer.clear();
  }

  removeLayer(depth = 0) {
    const index = this._layers.findIndex((l) => l.depth === depth);
    if (index > -1) {
      this._layers.splice(index, 1);
    }
  }

  _createNode() {
    return document.createElement("canvas");
  }

  _configure(options: Options) {
    this._width = options.width || this._width;
    this._height = options.height || this._height;
    this._autoRender = options.render !== false;
    this._setGlyphs(options.glyphs);
    this.bg = Color.from(options.bg || Color.BLACK);

    if (options.div) {
      let el;
      if (typeof options.div === "string") {
        el = document.getElementById(options.div);
        if (!el) {
          console.warn("Failed to find parent element by ID: " + options.div);
        }
      } else {
        el = options.div;
      }
      if (el && el.appendChild) {
        el.appendChild(this.node);
      }
    }
  }

  _setGlyphs(glyphs: Glyphs) {
    if (glyphs === this._glyphs) return false;

    this._glyphs = glyphs;
    this.resize(this._width, this._height);

    const gl = this._gl;
    const uniforms = this._uniforms;
    gl.uniform2uiv(uniforms["tileSize"], [this.tileWidth, this.tileHeight]);

    this._uploadGlyphs();
    return true;
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;

    const node = this.node;
    node.width = this._width * this.tileWidth;
    node.height = this._height * this.tileHeight;

    const gl = this._gl;
    // const uniforms = this._uniforms;
    gl.viewport(0, 0, this.node.width, this.node.height);
    // gl.uniform2ui(uniforms["viewportSize"], this.node.width, this.node.height);

    this._createGeometry();
    this._createData();
  }

  _requestRender() {
    if (this._renderRequested) return;
    this._renderRequested = true;
    if (!this._autoRender) return;
    requestAnimationFrame(() => this.render());
  }

  hasXY(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  toX(x: number) {
    return Math.floor((this.width * x) / this.node.clientWidth);
  }

  toY(y: number) {
    return Math.floor((this.height * y) / this.node.clientHeight);
  }

  _createContext() {
    let gl = this.node.getContext("webgl2");
    if (!gl) {
      throw new NotSupportedError("WebGL 2 not supported");
    }
    this._gl = gl;
    this._buffers = {};
    this._attribs = {};
    this._uniforms = {};

    const p = createProgram(gl, shaders.VS, shaders.FS);
    gl.useProgram(p);
    const attributeCount = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attributeCount; i++) {
      gl.enableVertexAttribArray(i);
      let info = gl.getActiveAttrib(p, i) as WebGLActiveInfo;
      this._attribs[info.name] = i;
    }
    const uniformCount = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      let info = gl.getActiveUniform(p, i) as WebGLActiveInfo;
      this._uniforms[info.name] = gl.getUniformLocation(
        p,
        info.name
      ) as WebGLUniformLocation;
    }
    gl.uniform1i(this._uniforms["font"], 0);
    this._texture = createTexture(gl);
  }

  _createGeometry() {
    const gl = this._gl;
    this._buffers.position && gl.deleteBuffer(this._buffers.position);
    this._buffers.uv && gl.deleteBuffer(this._buffers.uv);
    let buffers = createGeometry(gl, this._attribs, this.width, this.height);
    Object.assign(this._buffers, buffers);
  }

  _createData() {
    const gl = this._gl;
    const attribs = this._attribs;
    this._buffers.fg && gl.deleteBuffer(this._buffers.fg);
    this._buffers.bg && gl.deleteBuffer(this._buffers.bg);
    this._buffers.glyph && gl.deleteBuffer(this._buffers.glyph);
    if (this._layers.length) {
      this._layers.forEach((l) => l.detach());
      this._layers.length = 0;
    }

    const fg = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fg);
    gl.vertexAttribIPointer(attribs["fg"], 1, gl.UNSIGNED_SHORT, 0, 0);

    const bg = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bg);
    gl.vertexAttribIPointer(attribs["bg"], 1, gl.UNSIGNED_SHORT, 0, 0);

    const glyph = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glyph);
    gl.vertexAttribIPointer(attribs["glyph"], 1, gl.UNSIGNED_BYTE, 0, 0);

    Object.assign(this._buffers, { fg, bg, glyph });
  }

  _uploadGlyphs() {
    if (!this._glyphs.needsUpdate) return;

    const gl = this._gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this._glyphs.node
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    this._requestRender();
    this._glyphs.needsUpdate = false;
  }

  draw(x: number, y: number, glyph: number, fg: number, bg: number): void {
    this.layer(0).draw(x, y, glyph, fg, bg);
  }

  render() {
    const gl = this._gl;

    if (this._glyphs.needsUpdate) {
      // auto keep glyphs up to date
      this._uploadGlyphs();
    } else if (!this._renderRequested) {
      return;
    }

    this._renderRequested = false;

    // clear to bg color?
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(
      this.bg.r / 100,
      this.bg.g / 100,
      this.bg.b / 100,
      this.bg.a / 100
    );
    gl.clear(gl.COLOR_BUFFER_BIT);

    // sort layers?

    this._layers.forEach((layer) => {
      if (layer.empty) return;

      // set depth
      gl.uniform1i(this._uniforms["depth"], layer.depth);

      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.fg!);
      gl.bufferData(gl.ARRAY_BUFFER, layer.fg, gl.DYNAMIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.bg!);
      gl.bufferData(gl.ARRAY_BUFFER, layer.bg, gl.DYNAMIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.glyph!);
      gl.bufferData(gl.ARRAY_BUFFER, layer.glyph, gl.DYNAMIC_DRAW);

      gl.drawArrays(
        gl.TRIANGLES,
        0,
        this._width * this._height * VERTICES_PER_TILE
      );
    });
  }
}

export interface ImageOptions extends Options {
  image: HTMLImageElement | string;
}

export type FontOptions = Options & GlyphOptions;

export function withImage(image: ImageOptions | HTMLImageElement | string) {
  let opts = {} as Options;
  if (typeof image === "string") {
    opts.glyphs = Glyphs.fromImage(image);
  } else if (image instanceof HTMLImageElement) {
    opts.glyphs = Glyphs.fromImage(image);
  } else {
    if (!image.image) throw new Error("You must supply the image.");
    Object.assign(opts, image);
    opts.glyphs = Glyphs.fromImage(image.image);
  }

  return new Canvas(opts);
}

export function withFont(src: FontOptions | string) {
  if (typeof src === "string") {
    src = { font: src } as FontOptions;
  }
  src.glyphs = Glyphs.fromFont(src);
  return new Canvas(src);
}

// Copy of: https://github.com/ondras/fastiles/blob/master/ts/utils.ts (v2.1.0)

export function createProgram(gl: GL, ...sources: string[]) {
  const p = gl.createProgram() as WebGLProgram;

  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, index) => {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, sources[index]);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) as string);
    }
    gl.attachShader(p, shader);
  });

  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) as string);
  }

  return p;
}

function createTexture(gl: GL) {
  let t = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  return t;
}

// x, y offsets for 6 verticies (2 triangles) in square
export const QUAD = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];

function createGeometry(
  gl: GL,
  attribs: Record<string, number>,
  width: number,
  height: number
) {
  let tileCount = width * height;
  let positionData = new Float32Array(tileCount * QUAD.length);
  let offsetData = new Uint8Array(tileCount * QUAD.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (x + y * width) * QUAD.length;
      positionData.set(
        QUAD.map((v, i) => {
          if (i % 2) {
            // y
            return 1 - (2 * (y + v)) / height;
          } else {
            return (2 * (x + v)) / width - 1;
          }
        }),
        index
      );
      offsetData.set(QUAD, index);
    }
  }

  const position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.vertexAttribPointer(attribs["position"], 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

  const uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uv);
  gl.vertexAttribIPointer(attribs["offset"], 2, gl.UNSIGNED_BYTE, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, offsetData, gl.STATIC_DRAW);

  return { position, uv };
}
