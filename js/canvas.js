// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)
import { createProgram, createTexture, createGeometry } from "./utils";
import * as shaders from "./shaders";
const VERTICES_PER_TILE = 6;
export class NotSupportedError extends Error {
    constructor(...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        // @ts-ignore
        if (Error.captureStackTrace) {
            // @ts-ignore
            Error.captureStackTrace(this, NotSupportedError);
        }
        this.name = 'NotSupportedError';
    }
}
export class BaseCanvas {
    constructor(options) {
        this._renderRequested = false;
        this._autoRender = true;
        this._width = 50;
        this._height = 25;
        if (!options.glyphs)
            throw new Error('You must supply glyphs for the canvas.');
        this._node = this._createNode();
        this._createContext();
        this._configure(options);
    }
    get node() { return this._node; }
    get width() { return this._width; }
    get height() { return this._height; }
    get tileWidth() { return this._glyphs.tileWidth; }
    get tileHeight() { return this._glyphs.tileHeight; }
    get pxWidth() { return this.node.clientWidth; }
    get pxHeight() { return this.node.clientHeight; }
    get glyphs() { return this._glyphs; }
    set glyphs(glyphs) {
        this._setGlyphs(glyphs);
    }
    _createNode() {
        return document.createElement("canvas");
    }
    _configure(options) {
        this._width = options.width || this._width;
        this._height = options.height || this._height;
        this._autoRender = (options.render !== false);
        this._setGlyphs(options.glyphs);
        if (options.div) {
            let el;
            if (typeof options.div === 'string') {
                el = document.getElementById(options.div);
                if (!el) {
                    console.warn('Failed to find parent element by ID: ' + options.div);
                }
            }
            else {
                el = options.div;
            }
            if (el && el.appendChild) {
                el.appendChild(this.node);
            }
        }
    }
    _setGlyphs(glyphs) {
        if (glyphs === this._glyphs)
            return false;
        this._glyphs = glyphs;
        this.resize(this._width, this._height);
        return true;
    }
    resize(width, height) {
        this._width = width;
        this._height = height;
        const node = this.node;
        node.width = this._width * this.tileWidth;
        node.height = this._height * this.tileHeight;
    }
    draw(x, y, glyph, fg, bg) {
        glyph = glyph & 0xFF;
        bg = bg & 0xFFF;
        fg = fg & 0xFFF;
        const style = (glyph * (1 << 24)) + (bg * (1 << 12)) + fg;
        this._set(x, y, style);
    }
    _requestRender() {
        if (this._renderRequested)
            return;
        this._renderRequested = true;
        if (!this._autoRender)
            return;
        requestAnimationFrame(() => this.render());
    }
    _set(x, y, style) {
        let index = y * this.width + x;
        const current = this._data[index];
        if (current !== style) {
            this._data[index] = style;
            this._requestRender();
            return true;
        }
        return false;
    }
    copy(buffer) {
        this._data.set(buffer.data);
        this._requestRender();
    }
    copyTo(buffer) {
        buffer.data.set(this._data);
    }
    hasXY(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }
    toX(x) {
        return Math.floor(this.width * x / this.node.clientWidth);
    }
    toY(y) {
        return Math.floor(this.height * y / this.node.clientHeight);
    }
}
export class Canvas extends BaseCanvas {
    constructor(options) {
        super(options);
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
            let info = gl.getActiveAttrib(p, i);
            this._attribs[info.name] = i;
        }
        const uniformCount = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let info = gl.getActiveUniform(p, i);
            this._uniforms[info.name] = gl.getUniformLocation(p, info.name);
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
        const tileCount = this.width * this.height;
        this._buffers.style && gl.deleteBuffer(this._buffers.style);
        this._data = new Uint32Array(tileCount * VERTICES_PER_TILE);
        const style = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, style);
        gl.vertexAttribIPointer(attribs["style"], 1, gl.UNSIGNED_INT, 0, 0);
        Object.assign(this._buffers, { style });
    }
    _setGlyphs(glyphs) {
        if (!super._setGlyphs(glyphs))
            return false;
        const gl = this._gl;
        const uniforms = this._uniforms;
        gl.uniform2uiv(uniforms["tileSize"], [this.tileWidth, this.tileHeight]);
        this._uploadGlyphs();
        return true;
    }
    _uploadGlyphs() {
        if (!this._glyphs.needsUpdate)
            return;
        const gl = this._gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._glyphs.node);
        this._requestRender();
        this._glyphs.needsUpdate = false;
    }
    resize(width, height) {
        super.resize(width, height);
        const gl = this._gl;
        const uniforms = this._uniforms;
        gl.viewport(0, 0, this.node.width, this.node.height);
        gl.uniform2ui(uniforms["viewportSize"], this.node.width, this.node.height);
        this._createGeometry();
        this._createData();
    }
    _set(x, y, style) {
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
    copy(buffer) {
        buffer.data.forEach((style, i) => {
            const index = i * VERTICES_PER_TILE;
            this._data[index + 2] = style;
            this._data[index + 5] = style;
        });
        this._requestRender();
    }
    copyTo(buffer) {
        const n = this.width * this.height;
        const dest = buffer.data;
        for (let i = 0; i < n; ++i) {
            const index = i * VERTICES_PER_TILE;
            dest[i] = this._data[index + 2];
        }
    }
    render() {
        const gl = this._gl;
        if (this._glyphs.needsUpdate) { // auto keep glyphs up to date
            this._uploadGlyphs();
        }
        else if (!this._renderRequested) {
            return;
        }
        this._renderRequested = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.style);
        gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, this._width * this._height * VERTICES_PER_TILE);
    }
}
export class Canvas2D extends BaseCanvas {
    constructor(options) {
        super(options);
    }
    _createContext() {
        const ctx = this.node.getContext('2d');
        if (!ctx) {
            throw new NotSupportedError('2d context not supported!');
        }
        this._ctx = ctx;
    }
    _set(x, y, style) {
        const result = super._set(x, y, style);
        if (result) {
            this._changed[y * this.width + x] = 1;
        }
        return result;
    }
    resize(width, height) {
        super.resize(width, height);
        this._data = new Uint32Array(width * height);
        this._changed = new Int8Array(width * height);
    }
    copy(buffer) {
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
            if (this._changed[i])
                this._renderCell(i);
            this._changed[i] = 0;
        }
    }
    _renderCell(index) {
        const x = index % this.width;
        const y = Math.floor(index / this.width);
        const style = this._data[index];
        const glyph = (style / (1 << 24)) >> 0;
        const bg = (style >> 12) & 0xFFF;
        const fg = (style & 0xFFF);
        const px = x * this.tileWidth;
        const py = y * this.tileHeight;
        const gx = (glyph % 16) * this.tileWidth;
        const gy = Math.floor(glyph / 16) * this.tileHeight;
        // this._ctx.fillStyle = '#' + bg.toString(16).padStart(3, '0');
        // this._ctx.fillRect(px, py, this.tileWidth, this.tileHeight);
        // 
        // this._ctx.fillStyle = '#' + fg.toString(16).padStart(3, '0');
        // this._ctx.drawImage(this.glyphs.node, gx, gy, this.tileWidth, this.tileHeight, px, py, this.tileWidth, this.tileHeight);
        const d = this.glyphs.ctx.getImageData(gx, gy, this.tileWidth, this.tileHeight);
        for (let di = 0; di < d.width * d.height; ++di) {
            const src = (d.data[di * 4] > 127) ? fg : bg;
            d.data[di * 4 + 0] = ((src & 0xF00) >> 8) * 17;
            d.data[di * 4 + 1] = ((src & 0xF0) >> 4) * 17;
            d.data[di * 4 + 2] = (src & 0xF) * 17;
            d.data[di * 4 + 3] = 255; // not transparent anymore
        }
        this._ctx.putImageData(d, px, py);
    }
}
