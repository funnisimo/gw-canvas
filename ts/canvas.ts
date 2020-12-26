// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)

import * as shaders from "./shaders";
import { Glyphs, Options as GlyphOptions } from "./glyphs";
import { DataBuffer } from "./buffer";

type GL = WebGL2RenderingContext;
const VERTICES_PER_TILE = 6;

export interface Options {
  width?: number;
  height?: number;
  glyphs: Glyphs;
  div?: HTMLElement | string;
  render?: boolean;
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

export abstract class BaseCanvas {
  protected _data!: Uint32Array;
  protected _renderRequested: boolean = false;
  protected _glyphs!: Glyphs;
  protected _autoRender: boolean = true;
  protected _node: HTMLCanvasElement;

  protected _width: number = 50;
  protected _height: number = 25;

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

  protected _createNode() {
    return document.createElement("canvas");
  }

  protected abstract _createContext(): void;

  private _configure(options: Options) {
    this._width = options.width || this._width;
    this._height = options.height || this._height;
    this._autoRender = options.render !== false;
    this._setGlyphs(options.glyphs);

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

  protected _setGlyphs(glyphs: Glyphs) {
    if (glyphs === this._glyphs) return false;

    this._glyphs = glyphs;
    this.resize(this._width, this._height);
    return true;
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;

    const node = this.node;
    node.width = this._width * this.tileWidth;
    node.height = this._height * this.tileHeight;
  }

  draw(x: number, y: number, glyph: number, fg: number, bg: number) {
    glyph = glyph & 0xff;
    bg = bg & 0xfff;
    fg = fg & 0xfff;
    const style = glyph * (1 << 24) + bg * (1 << 12) + fg;
    this._set(x, y, style);
  }

  protected _requestRender() {
    if (this._renderRequested) return;
    this._renderRequested = true;
    if (!this._autoRender) return;
    requestAnimationFrame(() => this.render());
  }

  protected _set(x: number, y: number, style: number) {
    let index = y * this.width + x;
    const current = this._data[index];
    if (current !== style) {
      this._data[index] = style;
      this._requestRender();
      return true;
    }
    return false;
  }

  copy(buffer: DataBuffer) {
    this._data.set(buffer.data);
    this._requestRender();
  }

  copyTo(buffer: DataBuffer) {
    buffer.data.set(this._data);
  }

  abstract render(): void;

  hasXY(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  toX(x: number) {
    return Math.floor((this.width * x) / this.node.clientWidth);
  }

  toY(y: number) {
    return Math.floor((this.height * y) / this.node.clientHeight);
  }
}

export class Canvas extends BaseCanvas {
  private _gl!: GL;
  private _buffers!: {
    position?: WebGLBuffer;
    uv?: WebGLBuffer;
    style?: WebGLBuffer;
  };
  private _attribs!: Record<string, number>;
  private _uniforms!: Record<string, WebGLUniformLocation>;
  private _texture!: WebGLTexture;

  constructor(options: Options) {
    super(options);
  }

  protected _createContext() {
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

  private _createGeometry() {
    const gl = this._gl;
    this._buffers.position && gl.deleteBuffer(this._buffers.position);
    this._buffers.uv && gl.deleteBuffer(this._buffers.uv);
    let buffers = createGeometry(gl, this._attribs, this.width, this.height);
    Object.assign(this._buffers, buffers);
  }

  private _createData() {
    const gl = this._gl;
    const attribs = this._attribs;
    const tileCount = this.width * this.height;
    this._buffers.style && gl.deleteBuffer(this._buffers.style);
    this._data = new Uint32Array(tileCount * VERTICES_PER_TILE);
    const style = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, style);
    gl.vertexAttribIPointer(attribs["style"], 1, gl.UNSIGNED_INT, 0, 0);
    Object.assign(this._buffers, { style });
  }

  protected _setGlyphs(glyphs: Glyphs) {
    if (!super._setGlyphs(glyphs)) return false;
    const gl = this._gl;
    const uniforms = this._uniforms;
    gl.uniform2uiv(uniforms["tileSize"], [this.tileWidth, this.tileHeight]);

    this._uploadGlyphs();
    return true;
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
    this._requestRender();
    this._glyphs.needsUpdate = false;
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    const gl = this._gl;
    const uniforms = this._uniforms;
    gl.viewport(0, 0, this.node.width, this.node.height);
    gl.uniform2ui(uniforms["viewportSize"], this.node.width, this.node.height);

    this._createGeometry();
    this._createData();
  }

  protected _set(x: number, y: number, style: number) {
    let index = y * this.width + x;
    index *= VERTICES_PER_TILE;

    const current = this._data[index + 2];
    if (current !== style) {
      this._data[index + 2] = style;
      this._data[index + 5] = style;
      this._requestRender();
      return true;
    }
    return false;
  }

  copy(buffer: DataBuffer) {
    buffer.data.forEach((style, i) => {
      const index = i * VERTICES_PER_TILE;
      this._data[index + 2] = style;
      this._data[index + 5] = style;
    });
    this._requestRender();
  }

  copyTo(buffer: DataBuffer) {
    const n = this.width * this.height;
    const dest = buffer.data;
    for (let i = 0; i < n; ++i) {
      const index = i * VERTICES_PER_TILE;
      dest[i] = this._data[index + 2];
    }
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
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.style!);
    gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
    gl.drawArrays(
      gl.TRIANGLES,
      0,
      this._width * this._height * VERTICES_PER_TILE
    );
  }
}

export class Canvas2D extends BaseCanvas {
  private _ctx!: CanvasRenderingContext2D;
  private _changed!: Int8Array;

  constructor(options: Options) {
    super(options);
  }

  protected _createContext() {
    const ctx = this.node.getContext("2d");
    if (!ctx) {
      throw new NotSupportedError("2d context not supported!");
    }
    this._ctx = ctx;
  }

  protected _set(x: number, y: number, style: number) {
    const result = super._set(x, y, style);
    if (result) {
      this._changed[y * this.width + x] = 1;
    }
    return result;
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    this._data = new Uint32Array(width * height);
    this._changed = new Int8Array(width * height);
  }

  copy(buffer: DataBuffer) {
    for (let i = 0; i < this._data.length; ++i) {
      if (this._data[i] !== buffer.data[i]) {
        this._data[i] = buffer.data[i];
        this._changed[i] = 1;
      }
    }
    this._requestRender();
  }

  render() {
    this._renderRequested = false;
    for (let i = 0; i < this._changed.length; ++i) {
      if (this._changed[i]) this._renderCell(i);
      this._changed[i] = 0;
    }
  }

  protected _renderCell(index: number) {
    const x = index % this.width;
    const y = Math.floor(index / this.width);

    const style = this._data[index];
    const glyph = (style / (1 << 24)) >> 0;
    const bg = (style >> 12) & 0xfff;
    const fg = style & 0xfff;

    const px = x * this.tileWidth;
    const py = y * this.tileHeight;

    const gx = (glyph % 16) * this.tileWidth;
    const gy = Math.floor(glyph / 16) * this.tileHeight;

    const d = this.glyphs.ctx.getImageData(
      gx,
      gy,
      this.tileWidth,
      this.tileHeight
    );
    for (let di = 0; di < d.width * d.height; ++di) {
      const pct = d.data[di * 4] / 255;
      const inv = 1.0 - pct;
      d.data[di * 4 + 0] =
        pct * (((fg & 0xf00) >> 8) * 17) + inv * (((bg & 0xf00) >> 8) * 17);
      d.data[di * 4 + 1] =
        pct * (((fg & 0xf0) >> 4) * 17) + inv * (((bg & 0xf0) >> 4) * 17);
      d.data[di * 4 + 2] = pct * ((fg & 0xf) * 17) + inv * ((bg & 0xf) * 17);
      d.data[di * 4 + 3] = 255; // not transparent anymore
    }
    this._ctx.putImageData(d, px, py);
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

  let canvas;
  try {
    canvas = new Canvas(opts);
  } catch (e) {
    if (!(e instanceof NotSupportedError)) throw e;
  }

  if (!canvas) {
    canvas = new Canvas2D(opts);
  }

  return canvas;
}

export function withFont(src: FontOptions | string) {
  if (typeof src === "string") {
    src = { font: src } as FontOptions;
  }
  src.glyphs = Glyphs.fromFont(src);
  let canvas;
  try {
    canvas = new Canvas(src);
  } catch (e) {
    if (!(e instanceof NotSupportedError)) throw e;
  }

  if (!canvas) {
    canvas = new Canvas2D(src);
  }

  return canvas;
}

// Copy of: https://github.com/ondras/fastiles/blob/master/ts/utils.ts (v2.1.0)

export const QUAD = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];

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

export function createTexture(gl: GL) {
  let t = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  return t;
}

export function createGeometry(
  gl: GL,
  attribs: Record<string, number>,
  width: number,
  height: number
) {
  let tileCount = width * height;
  let positionData = new Uint16Array(tileCount * QUAD.length);
  let uvData = new Uint8Array(tileCount * QUAD.length);
  let i = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      QUAD.forEach((value) => {
        positionData[i] = (i % 2 ? y : x) + value;
        uvData[i] = value;
        i++;
      });
    }
  }

  const position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.vertexAttribIPointer(attribs["position"], 2, gl.UNSIGNED_SHORT, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

  const uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uv);
  gl.vertexAttribIPointer(attribs["uv"], 2, gl.UNSIGNED_BYTE, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);

  return { position, uv };
}
