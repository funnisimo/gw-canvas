// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)

import { createProgram, createTexture, createGeometry } from "./utils";
import * as shaders from "./shaders";
import { Glyphs } from './glyphs'; 
import { Buffer } from './buffer';

type GL = WebGL2RenderingContext;
const VERTICES_PER_TILE = 6;

export interface Options {
	width?: number;
	height?: number;
	glyphs: Glyphs;
	node?: HTMLCanvasElement|string;
	render?: boolean;
}

export class Canvas {
	private _gl!: GL;
	private _data = new Uint32Array();
	private _buffers: {
		position?: WebGLBuffer;
		uv?: WebGLBuffer;
		style?: WebGLBuffer;
	} = {};
	private _attribs: Record<string, number> = {};
	private _uniforms: Record<string, WebGLUniformLocation> = {};
	private _renderRequested: boolean = false;
	private _texture!: WebGLTexture;
	private _glyphs!: Glyphs;
	private _autoRender: boolean=true;
	
	private _width:number=50;
	private _height:number=25;

  constructor(options: Options) {
		if (!options.glyphs) throw new Error('You must supply glyphs for the canvas.');
    this._gl = this._initGL(options.node);
    this._configure(options);
  }
	
  get node() { return this._gl.canvas; }
	get width() { return this._width; }
	get height() { return this._height; }
	get tileWidth() { return this._glyphs.tileWidth; }
	get tileHeight() { return this._glyphs.tileHeight; }
	get pxWidth() { return this.node.width; }
	get pxHeight() { return this.node.height; }

	get glyphs():Glyphs { return this._glyphs; }
	set glyphs(glyphs: Glyphs) {
		const gl = this._gl;
		const uniforms = this._uniforms;

		if (glyphs === this._glyphs && !glyphs.needsUpdate) return;

		if (glyphs !== this._glyphs) {
		  this._glyphs = glyphs;
			this.resize(this._width, this._height);
			gl.uniform2uiv(uniforms["tileSize"], [this.tileWidth, this.tileHeight]);
		}

		this._uploadGlyphs();
	}
		
	private _configure(options: Options) {
		this._width = options.width || this._width;
		this._height = options.height || this._height;
		this._autoRender = (options.render !== false);

		this.glyphs = options.glyphs;
	}

	resize(width: number, height: number) {
		this._width = width;
		this._height = height;

		const node = this.node;
		node.width = this._width * this.tileWidth;
		node.height = this._height * this.tileHeight;

		const gl = this._gl;
		const uniforms = this._uniforms;
		gl.viewport(0, 0, node.width, node.height);
		gl.uniform2ui(uniforms["viewportSize"], node.width, node.height);

		this._createGeometry();
		this._createData();
	}

  draw(x: number, y: number, glyph: number, fg: number, bg: number) {
      let index = y * this._width + x;
      index *= VERTICES_PER_TILE;
			glyph = glyph & 0xFF;
			bg = bg & 0xFFF;
			fg = fg & 0xFFF;
      const style = (glyph << 24) + (bg << 12) + fg;
      this._data[index + 2] = style;
      this._data[index + 5] = style;
      this._requestRender();
  }
	
	copy(buffer: Buffer) {
		buffer.data.forEach( (style, i) => {
			const index = i * VERTICES_PER_TILE;
			this._data[index + 2] = style;
			this._data[index + 5] = style;
		});
		this._requestRender();
	}

	copyTo(buffer: Buffer) {
		const n = this.width * this.height;
		const dest = buffer.data;
		for(let i = 0; i < n; ++i) {
			const index = i * VERTICES_PER_TILE;
			dest[i] = this._data[index + 2];
		}
	}
	
  private _initGL(node?: HTMLCanvasElement|string) {
			if (typeof node === 'string') {
				const el = document.getElementById(node) as HTMLCanvasElement;
				if (!el) throw new Error('Failed to find canvas with id:' + node);
				if (!(el instanceof HTMLCanvasElement)) throw new Error('Canvas: node must be a canvas element.');
				node = el;
			}
			else if (!node) {
				node = document.createElement("canvas");
			}

      let gl = node.getContext("webgl2");
      if (!gl) {
          throw new Error("WebGL 2 not supported");
      }
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
          this._uniforms[info.name] = gl.getUniformLocation(p, info.name) as WebGLUniformLocation;
      }
      gl.uniform1i(this._uniforms["font"], 0);
      this._texture = createTexture(gl);
      return gl;
  }
	
  private _createGeometry() {
      const gl = this._gl;
      this._buffers.position && gl.deleteBuffer(this._buffers.position);
      this._buffers.uv && gl.deleteBuffer(this._buffers.uv);
      let buffers = createGeometry(gl, this._attribs, this._width, this._height);
      Object.assign(this._buffers, buffers);
  }
	
  private _createData() {
      const gl = this._gl;
      const attribs = this._attribs;
			const tileCount = this._width * this._height;
      this._buffers.style && gl.deleteBuffer(this._buffers.style);
      this._data = new Uint32Array(tileCount * VERTICES_PER_TILE);
      const style = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, style);
      gl.vertexAttribIPointer(attribs["style"], 1, gl.UNSIGNED_INT, 0, 0);
      Object.assign(this._buffers, { style });
  }
	
  private _requestRender() {
      if (this._renderRequested || !this._autoRender) {
          return;
      }
      this._renderRequested = true;
      requestAnimationFrame(() => this.render());
  }
	
  render() {
      const gl = this._gl;
			
			if (this._glyphs.needsUpdate) {	// auto keep glyphs up to date
				this._uploadGlyphs();
			}
			
      this._renderRequested = false;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.style!);
      gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, this._width * this._height * VERTICES_PER_TILE);
  }
	
  _uploadGlyphs() {
		if (!this._glyphs.needsUpdate) return;

    const gl = this._gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._glyphs.node);
    this._requestRender();
		this._glyphs.needsUpdate = false;
  }
	
	hasXY(x:number, y:number) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  toX(x:number) {
    return Math.floor(this.width * x / this.pxWidth);
  }

  toY(y:number) {
    return Math.floor(this.height * y / this.pxHeight);
  }

	
}


