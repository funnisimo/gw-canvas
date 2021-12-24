'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Based on: https://github.com/ondras/fastiles/blob/master/ts/shaders.ts (v2.1.0)
const VS = `
#version 300 es

in vec2 position;
in uvec2 offset;
in uint style;
in uint glyph;

out vec2 fsUv;
out vec3 fgRgb;
out vec3 bgRgb;
flat out uvec2 fontPos;

uniform uvec2 tileSize;

void main() {
	gl_Position = vec4(position, 0.0, 1.0);

	float fr = float((style & uint(0x00000F00)) >> 8);
	float fg = float((style & uint(0x000000F0)) >> 4);
	float fb = float(style & uint(0x0000000F));
	fgRgb = vec3(fr, fg, fb) / 15.0;
  
	float br = float((style & uint(0x00F00000)) >> 20);
	float bg = float((style & uint(0x000F0000)) >> 16);
	float bb = float((style & uint(0x0000F000)) >> 12);
	bgRgb = vec3(br, bg, bb) / 15.0;

	//uint glyph = (style & uint(0xFF000000)) >> 24;
	uint glyphX = (glyph & uint(0xF));
	uint glyphY = (glyph >> 4);
	fontPos = uvec2(glyphX, glyphY);

	fsUv = vec2(offset);
}`.trim();
const FS = `
#version 300 es
precision highp float;

in vec2 fsUv;
in vec3 fgRgb;
in vec3 bgRgb;
flat in uvec2 fontPos;

out vec4 fragColor;

uniform sampler2D font;
uniform highp uvec2 tileSize;

void main() {
	uvec2 fontPx = (tileSize * fontPos) + uvec2(vec2(tileSize) * fsUv);
	vec3 texel = texelFetch(font, ivec2(fontPx), 0).rgb;

	fragColor = vec4(mix(bgRgb, fgRgb, texel), 1.0);
}`.trim();

class Glyphs {
    constructor(opts = {}) {
        this._tileWidth = 12;
        this._tileHeight = 16;
        this.needsUpdate = true;
        this._map = {};
        opts.font = opts.font || 'monospace';
        this._node = document.createElement('canvas');
        this._ctx = this.node.getContext('2d');
        this._configure(opts);
    }
    static fromImage(src) {
        if (typeof src === 'string') {
            if (src.startsWith('data:'))
                throw new Error('Glyph: You must load a data string into an image element and use that.');
            const el = document.getElementById(src);
            if (!el)
                throw new Error('Glyph: Failed to find image element with id:' + src);
            src = el;
        }
        const glyph = new this({ tileWidth: src.width / 16, tileHeight: src.height / 16 });
        glyph._ctx.drawImage(src, 0, 0);
        return glyph;
    }
    static fromFont(src) {
        if (typeof src === 'string') {
            src = { font: src };
        }
        const glyphs = new this(src);
        const basicOnly = src.basicOnly || src.basic || false;
        glyphs._initGlyphs(basicOnly);
        return glyphs;
    }
    get node() { return this._node; }
    get ctx() { return this._ctx; }
    get tileWidth() { return this._tileWidth; }
    get tileHeight() { return this._tileHeight; }
    get pxWidth() { return this._node.width; }
    get pxHeight() { return this._node.height; }
    forChar(ch) {
        if (ch === null || ch === undefined)
            return -1;
        return this._map[ch] || -1;
    }
    _configure(opts) {
        this._tileWidth = opts.tileWidth || this.tileWidth;
        this._tileHeight = opts.tileHeight || this.tileHeight;
        this.node.width = 16 * this.tileWidth;
        this.node.height = 16 * this.tileHeight;
        this._ctx.fillStyle = 'black';
        this._ctx.fillRect(0, 0, this.pxWidth, this.pxHeight);
        const size = opts.fontSize || opts.size || Math.max(this.tileWidth, this.tileHeight);
        this._ctx.font = '' + size + 'px ' + opts.font;
        this._ctx.textAlign = 'center';
        this._ctx.textBaseline = 'middle';
        this._ctx.fillStyle = 'white';
    }
    draw(n, ch) {
        if (n > 256)
            throw new Error('Cannot draw more than 256 glyphs.');
        const x = (n % 16) * this.tileWidth;
        const y = Math.floor(n / 16) * this.tileHeight;
        const cx = x + Math.floor(this.tileWidth / 2);
        const cy = y + Math.floor(this.tileHeight / 2);
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.rect(x, y, this.tileWidth, this.tileHeight);
        this._ctx.clip();
        if (typeof ch === 'function') {
            ch(this._ctx, x, y, this.tileWidth, this.tileHeight);
        }
        else {
            if (this._map[ch] === undefined)
                this._map[ch] = n;
            this._ctx.fillText(ch, cx, cy);
        }
        this._ctx.restore();
        this.needsUpdate = true;
    }
    _initGlyphs(basicOnly = false) {
        for (let i = 32; i < 127; ++i) {
            this.draw(i, String.fromCharCode(i));
        }
        if (!basicOnly) {
            [' ', '\u263a', '\u263b', '\u2665', '\u2666', '\u2663', '\u2660', '\u263c',
                '\u2600', '\u2605', '\u2606', '\u2642', '\u2640', '\u266a', '\u266b', '\u2638',
                '\u25b6', '\u25c0', '\u2195', '\u203c', '\u204b', '\u262f', '\u2318', '\u2616',
                '\u2191', '\u2193', '\u2192', '\u2190', '\u2126', '\u2194', '\u25b2', '\u25bc',
            ].forEach((ch, i) => {
                this.draw(i, ch);
            });
            // [
            // '\u2302',
            // '\u2b09', '\u272a', '\u2718', '\u2610', '\u2611', '\u25ef', '\u25ce', '\u2690',
            // '\u2691', '\u2598', '\u2596', '\u259d', '\u2597', '\u2744', '\u272d', '\u2727',
            // '\u25e3', '\u25e4', '\u25e2', '\u25e5', '\u25a8', '\u25a7', '\u259a', '\u265f',
            // '\u265c', '\u265e', '\u265d', '\u265b', '\u265a', '\u301c', '\u2694', '\u2692',
            // '\u25b6', '\u25bc', '\u25c0', '\u25b2', '\u25a4', '\u25a5', '\u25a6', '\u257a',
            // '\u257b', '\u2578', '\u2579', '\u2581', '\u2594', '\u258f', '\u2595', '\u272d',
            // '\u2591', '\u2592', '\u2593', '\u2503', '\u252b', '\u2561', '\u2562', '\u2556',
            // '\u2555', '\u2563', '\u2551', '\u2557', '\u255d', '\u255c', '\u255b', '\u2513',
            // '\u2517', '\u253b', '\u2533', '\u2523', '\u2501', '\u254b', '\u255e', '\u255f',
            // '\u255a', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256c', '\u2567',
            // '\u2568', '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256b',
            // '\u256a', '\u251b', '\u250f', '\u2588', '\u2585', '\u258c', '\u2590', '\u2580',
            // '\u03b1', '\u03b2', '\u0393', '\u03c0', '\u03a3', '\u03c3', '\u03bc', '\u03c4',
            // '\u03a6', '\u03b8', '\u03a9', '\u03b4', '\u221e', '\u03b8', '\u03b5', '\u03b7',
            // '\u039e', '\u00b1', '\u2265', '\u2264', '\u2234', '\u2237', '\u00f7', '\u2248',
            // '\u22c4', '\u22c5', '\u2217', '\u27b5', '\u2620', '\u2625', '\u25fc', '\u25fb'
            // ].forEach( (ch, i) => {
            //   this.draw(i + 127, ch); 
            // });
            ['\u2302',
                '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4', '\u00E0', '\u00E5', '\u00E7',
                '\u00EA', '\u00EB', '\u00E8', '\u00EF', '\u00EE', '\u00EC', '\u00C4', '\u00C5',
                '\u00C9', '\u00E6', '\u00C6', '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9',
                '\u00FF', '\u00D6', '\u00DC', '\u00A2', '\u00A3', '\u00A5', '\u20A7', '\u0192',
                '\u00E1', '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1', '\u00AA', '\u00BA',
                '\u00BF', '\u2310', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB', '\u00BB',
                '\u2591', '\u2592', '\u2593', '\u2502', '\u2524', '\u2561', '\u2562', '\u2556',
                '\u2555', '\u2563', '\u2551', '\u2557', '\u255D', '\u255C', '\u255B', '\u2510',
                '\u2514', '\u2534', '\u252C', '\u251C', '\u2500', '\u253C', '\u255E', '\u255F',
                '\u255A', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256C', '\u2567',
                '\u2568', '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256B',
                '\u256A', '\u2518', '\u250C', '\u2588', '\u2584', '\u258C', '\u2590', '\u2580',
                '\u03B1', '\u00DF', '\u0393', '\u03C0', '\u03A3', '\u03C3', '\u00B5', '\u03C4',
                '\u03A6', '\u0398', '\u03A9', '\u03B4', '\u221E', '\u03C6', '\u03B5', '\u2229',
                '\u2261', '\u00B1', '\u2265', '\u2264', '\u2320', '\u2321', '\u00F7', '\u2248',
                '\u00B0', '\u2219', '\u00B7', '\u221A', '\u207F', '\u00B2', '\u25A0', '\u00A0'
            ].forEach((ch, i) => {
                this.draw(i + 127, ch);
            });
        }
    }
}

// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)
const VERTICES_PER_TILE = 6;
class NotSupportedError extends Error {
    constructor(...params) {
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
class BaseCanvas {
    constructor(options) {
        this._renderRequested = false;
        this._autoRender = true;
        this._width = 50;
        this._height = 25;
        if (!options.glyphs)
            throw new Error("You must supply glyphs for the canvas.");
        this._node = this._createNode();
        this._createContext();
        this._configure(options);
    }
    get node() {
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
    get glyphs() {
        return this._glyphs;
    }
    set glyphs(glyphs) {
        this._setGlyphs(glyphs);
    }
    _createNode() {
        return document.createElement("canvas");
    }
    _configure(options) {
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
        glyph = glyph & 0xff;
        bg = bg & 0xfff;
        fg = fg & 0xfff;
        const style = glyph * (1 << 24) + bg * (1 << 12) + fg;
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
    hasXY(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }
    toX(x) {
        return Math.floor((this.width * x) / this.node.clientWidth);
    }
    toY(y) {
        return Math.floor((this.height * y) / this.node.clientHeight);
    }
}
class Canvas extends BaseCanvas {
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
        const p = createProgram(gl, VS, FS);
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
        this._buffers.glyph && gl.deleteBuffer(this._buffers.glyph);
        this._data = {
            style: new Uint32Array(tileCount * VERTICES_PER_TILE),
            glyph: new Uint8Array(tileCount * VERTICES_PER_TILE),
        };
        const style = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, style);
        gl.vertexAttribIPointer(attribs["style"], 1, gl.UNSIGNED_INT, 0, 0);
        const glyph = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, glyph);
        gl.vertexAttribIPointer(attribs["glyph"], 1, gl.UNSIGNED_BYTE, 0, 0);
        Object.assign(this._buffers, { style, glyph });
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        this._requestRender();
        this._glyphs.needsUpdate = false;
    }
    resize(width, height) {
        super.resize(width, height);
        const gl = this._gl;
        // const uniforms = this._uniforms;
        gl.viewport(0, 0, this.node.width, this.node.height);
        // gl.uniform2ui(uniforms["viewportSize"], this.node.width, this.node.height);
        this._createGeometry();
        this._createData();
    }
    _set(x, y, style) {
        let index = y * this.width + x;
        index *= VERTICES_PER_TILE;
        const sd = this._data.style;
        const gd = this._data.glyph;
        const current = sd[index];
        if (current !== style) {
            sd[index + 0] = style;
            sd[index + 1] = style;
            sd[index + 2] = style;
            sd[index + 3] = style;
            sd[index + 4] = style;
            sd[index + 5] = style;
            const g = (style & 0xff000000) >> 24;
            gd[index + 0] = g;
            gd[index + 1] = g;
            gd[index + 2] = g;
            gd[index + 3] = g;
            gd[index + 4] = g;
            gd[index + 5] = g;
            this._requestRender();
            return true;
        }
        return false;
    }
    copy(buffer) {
        const sd = this._data.style;
        const gd = this._data.glyph;
        buffer.data.forEach((style, i) => {
            const index = i * VERTICES_PER_TILE;
            sd[index + 0] = style;
            sd[index + 1] = style;
            sd[index + 2] = style;
            sd[index + 3] = style;
            sd[index + 4] = style;
            sd[index + 5] = style;
            const g = (style & 0xff000000) >> 24;
            gd[index + 0] = g;
            gd[index + 1] = g;
            gd[index + 2] = g;
            gd[index + 3] = g;
            gd[index + 4] = g;
            gd[index + 5] = g;
        });
        this._requestRender();
    }
    copyTo(buffer) {
        const n = this.width * this.height;
        const dest = buffer.data;
        for (let i = 0; i < n; ++i) {
            const index = i * VERTICES_PER_TILE;
            dest[i] = this._data.style[index + 0];
        }
    }
    render() {
        const gl = this._gl;
        if (this._glyphs.needsUpdate) {
            // auto keep glyphs up to date
            this._uploadGlyphs();
        }
        else if (!this._renderRequested) {
            return;
        }
        this._renderRequested = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.style);
        gl.bufferData(gl.ARRAY_BUFFER, this._data.style, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.glyph);
        gl.bufferData(gl.ARRAY_BUFFER, this._data.glyph, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, this._width * this._height * VERTICES_PER_TILE);
    }
}
class Canvas2D extends BaseCanvas {
    constructor(options) {
        super(options);
    }
    _createContext() {
        const ctx = this.node.getContext("2d");
        if (!ctx) {
            throw new NotSupportedError("2d context not supported!");
        }
        this._ctx = ctx;
    }
    _set(x, y, style) {
        let index = y * this.width + x;
        const current = this._data[index];
        if (current !== style) {
            this._data[index] = style;
            this._changed[y * this.width + x] = 1;
            this._requestRender();
            return true;
        }
        return false;
    }
    copyTo(buffer) {
        buffer.data.set(this._data);
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
        const bg = (style >> 12) & 0xfff;
        const fg = style & 0xfff;
        const px = x * this.tileWidth;
        const py = y * this.tileHeight;
        const gx = (glyph % 16) * this.tileWidth;
        const gy = Math.floor(glyph / 16) * this.tileHeight;
        const d = this.glyphs.ctx.getImageData(gx, gy, this.tileWidth, this.tileHeight);
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
function withImage(image) {
    let opts = {};
    if (typeof image === "string") {
        opts.glyphs = Glyphs.fromImage(image);
    }
    else if (image instanceof HTMLImageElement) {
        opts.glyphs = Glyphs.fromImage(image);
    }
    else {
        if (!image.image)
            throw new Error("You must supply the image.");
        Object.assign(opts, image);
        opts.glyphs = Glyphs.fromImage(image.image);
    }
    let canvas;
    try {
        canvas = new Canvas(opts);
    }
    catch (e) {
        if (!(e instanceof NotSupportedError))
            throw e;
    }
    if (!canvas) {
        canvas = new Canvas2D(opts);
    }
    return canvas;
}
function withFont(src) {
    if (typeof src === "string") {
        src = { font: src };
    }
    src.glyphs = Glyphs.fromFont(src);
    let canvas;
    try {
        canvas = new Canvas(src);
    }
    catch (e) {
        if (!(e instanceof NotSupportedError))
            throw e;
    }
    if (!canvas) {
        canvas = new Canvas2D(src);
    }
    return canvas;
}
// Copy of: https://github.com/ondras/fastiles/blob/master/ts/utils.ts (v2.1.0)
function createProgram(gl, ...sources) {
    const p = gl.createProgram();
    [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, index) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sources[index]);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        gl.attachShader(p, shader);
    });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p));
    }
    return p;
}
function createTexture(gl) {
    let t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return t;
}
// x, y offsets for 6 verticies (2 triangles) in square
const QUAD = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
function createGeometry(gl, attribs, width, height) {
    let tileCount = width * height;
    let positionData = new Float32Array(tileCount * QUAD.length);
    let offsetData = new Uint8Array(tileCount * QUAD.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (x + y * width) * QUAD.length;
            positionData.set(QUAD.map((v, i) => {
                if (i % 2) {
                    // y
                    return 1 - (2 * (y + v)) / height;
                }
                else {
                    return (2 * (x + v)) / width - 1;
                }
            }), index);
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

var options = {
    random: Math.random.bind(Math),
};
function configure(opts = {}) {
    Object.assign(options, opts);
}

function toColorInt(r = 0, g = 0, b = 0, base256 = false) {
    if (base256) {
        r = Math.max(0, Math.min(255, Math.round(r * 2.550001)));
        g = Math.max(0, Math.min(255, Math.round(g * 2.550001)));
        b = Math.max(0, Math.min(255, Math.round(b * 2.550001)));
        return (r << 16) + (g << 8) + b;
    }
    r = Math.max(0, Math.min(15, Math.round((r / 100) * 15)));
    g = Math.max(0, Math.min(15, Math.round((g / 100) * 15)));
    b = Math.max(0, Math.min(15, Math.round((b / 100) * 15)));
    return (r << 8) + (g << 4) + b;
}
const colors = {};
class Color extends Int16Array {
    constructor(r = -1, g = 0, b = 0, rand = 0, redRand = 0, greenRand = 0, blueRand = 0, dances = false) {
        super(7);
        this.dances = false;
        this.set([r, g, b, rand, redRand, greenRand, blueRand]);
        this.dances = dances;
    }
    static fromArray(vals, base256 = false) {
        while (vals.length < 3)
            vals.push(0);
        if (base256) {
            for (let i = 0; i < 7; ++i) {
                vals[i] = Math.round(((vals[i] || 0) * 100) / 255);
            }
        }
        return new this(...vals);
    }
    static fromCss(css) {
        if (!css.startsWith("#")) {
            throw new Error('Color CSS strings must be of form "#abc" or "#abcdef" - received: [' +
                css +
                "]");
        }
        const c = Number.parseInt(css.substring(1), 16);
        let r, g, b;
        if (css.length == 4) {
            r = Math.round(((c >> 8) / 15) * 100);
            g = Math.round((((c & 0xf0) >> 4) / 15) * 100);
            b = Math.round(((c & 0xf) / 15) * 100);
        }
        else {
            r = Math.round(((c >> 16) / 255) * 100);
            g = Math.round((((c & 0xff00) >> 8) / 255) * 100);
            b = Math.round(((c & 0xff) / 255) * 100);
        }
        return new this(r, g, b);
    }
    static fromName(name) {
        const c = colors[name];
        if (!c) {
            throw new Error("Unknown color name: " + name);
        }
        return c;
    }
    static fromNumber(val, base256 = false) {
        const c = new this();
        for (let i = 0; i < c.length; ++i) {
            c[i] = 0;
        }
        if (val < 0) {
            c._r = -1;
        }
        else if (base256 || val > 0xfff) {
            c._r = Math.round((((val & 0xff0000) >> 16) * 100) / 255);
            c._g = Math.round((((val & 0xff00) >> 8) * 100) / 255);
            c._b = Math.round(((val & 0xff) * 100) / 255);
        }
        else {
            c._r = Math.round((((val & 0xf00) >> 8) * 100) / 15);
            c._g = Math.round((((val & 0xf0) >> 4) * 100) / 15);
            c._b = Math.round(((val & 0xf) * 100) / 15);
        }
        return c;
    }
    static make(arg, base256 = false) {
        if (arg === undefined || arg === null)
            return new this(-1);
        if (arg instanceof Color) {
            return arg.clone();
        }
        if (typeof arg === "string") {
            if (arg.startsWith("#")) {
                return this.fromCss(arg);
            }
            return this.fromName(arg).clone();
        }
        else if (Array.isArray(arg)) {
            return this.fromArray(arg, base256);
        }
        else if (typeof arg === "number") {
            if (arg < 0)
                return new this(-1);
            return this.fromNumber(arg, base256);
        }
        throw new Error("Failed to make color - unknown argument: " + JSON.stringify(arg));
    }
    static from(...args) {
        const arg = args[0];
        if (arg instanceof Color)
            return arg;
        if (arg < 0 || arg === undefined)
            return new this(-1);
        if (typeof arg === "string") {
            if (!arg.startsWith("#")) {
                return this.fromName(arg);
            }
        }
        return this.make(arg, args[1]);
    }
    static install(name, info) {
        const c = info instanceof Color ? info : this.make(info);
        colors[name] = c;
        c.name = name;
        return c;
    }
    static installSpread(name, base) {
        const c = this.install(name, base);
        this.install("light_" + name, c.clone().lighten(25));
        this.install("lighter_" + name, c.clone().lighten(50));
        this.install("lightest_" + name, c.clone().lighten(75));
        this.install("dark_" + name, c.clone().darken(25));
        this.install("darker_" + name, c.clone().darken(50));
        this.install("darkest_" + name, c.clone().darken(75));
        return c;
    }
    get r() {
        return Math.round(this[0] * 2.550001);
    }
    get _r() {
        return this[0];
    }
    set _r(v) {
        this[0] = v;
    }
    get g() {
        return Math.round(this[1] * 2.550001);
    }
    get _g() {
        return this[1];
    }
    set _g(v) {
        this[1] = v;
    }
    get b() {
        return Math.round(this[2] * 2.550001);
    }
    get _b() {
        return this[2];
    }
    set _b(v) {
        this[2] = v;
    }
    get _rand() {
        return this[3];
    }
    get _redRand() {
        return this[4];
    }
    get _greenRand() {
        return this[5];
    }
    get _blueRand() {
        return this[6];
    }
    // luminosity (0-100)
    get l() {
        return Math.round(0.5 *
            (Math.min(this._r, this._g, this._b) +
                Math.max(this._r, this._g, this._b)));
    }
    // saturation (0-100)
    get s() {
        if (this.l >= 100)
            return 0;
        return Math.round(((Math.max(this._r, this._g, this._b) -
            Math.min(this._r, this._g, this._b)) *
            (100 - Math.abs(this.l * 2 - 100))) /
            100);
    }
    // hue (0-360)
    get h() {
        let H = 0;
        let R = this.r;
        let G = this.g;
        let B = this.b;
        if (R >= G && G >= B) {
            H = 60 * ((G - B) / (R - B));
        }
        else if (G > R && R >= B) {
            H = 60 * (2 - (R - B) / (G - B));
        }
        else if (G >= B && B > R) {
            H = 60 * (2 + (B - R) / (G - R));
        }
        else if (B > G && G > R) {
            H = 60 * (4 - (G - R) / (B - R));
        }
        else if (B > R && R >= G) {
            H = 60 * (4 + (R - G) / (B - G));
        }
        else {
            H = 60 * (6 - (B - G) / (R - G));
        }
        return Math.round(H);
    }
    isNull() {
        return this._r < 0;
    }
    equals(other) {
        if (typeof other === "string") {
            return other.length > 4
                ? this.toString(true) == other
                : this.toString() == other;
        }
        else if (typeof other === "number") {
            return this.toInt() == other || this.toInt(true) == other;
        }
        const O = Color.from(other);
        if (this.isNull())
            return O.isNull();
        return this.every((v, i) => {
            return v == (O[i] || 0);
        });
    }
    copy(other) {
        if (Array.isArray(other)) {
            this.set(other);
        }
        else {
            const O = Color.from(other);
            this.set(O);
        }
        if (other instanceof Color) {
            this.dances = other.dances;
            this.name = other.name;
        }
        else {
            this._changed();
        }
        return this;
    }
    _changed() {
        this.name = undefined;
        return this;
    }
    clone() {
        // @ts-ignore
        const other = new this.constructor();
        other.copy(this);
        return other;
    }
    assign(_r = -1, _g = 0, _b = 0, _rand = 0, _redRand = 0, _greenRand = 0, _blueRand = 0, dances) {
        for (let i = 0; i < this.length; ++i) {
            this[i] = arguments[i] || 0;
        }
        if (dances !== undefined) {
            this.dances = dances;
        }
        return this._changed();
    }
    assignRGB(_r = -1, _g = 0, _b = 0, _rand = 0, _redRand = 0, _greenRand = 0, _blueRand = 0, dances) {
        for (let i = 0; i < this.length; ++i) {
            this[i] = Math.round((arguments[i] || 0) / 2.55);
        }
        if (dances !== undefined) {
            this.dances = dances;
        }
        return this._changed();
    }
    nullify() {
        this[0] = -1;
        this.dances = false;
        return this._changed();
    }
    blackOut() {
        for (let i = 0; i < this.length; ++i) {
            this[i] = 0;
        }
        this.dances = false;
        return this._changed();
    }
    toInt(base256 = false) {
        if (this.isNull())
            return -1;
        return toColorInt(this._r, this._g, this._b, base256);
    }
    clamp() {
        if (this.isNull())
            return this;
        this._r = Math.min(100, Math.max(0, this._r));
        this._g = Math.min(100, Math.max(0, this._g));
        this._b = Math.min(100, Math.max(0, this._b));
        return this._changed();
    }
    mix(other, percent) {
        const O = Color.from(other);
        if (O.isNull())
            return this;
        if (this.isNull()) {
            this.blackOut();
        }
        percent = Math.min(100, Math.max(0, percent));
        const keepPct = 100 - percent;
        for (let i = 0; i < this.length; ++i) {
            this[i] = Math.round((this[i] * keepPct + O[i] * percent) / 100);
        }
        this.dances = this.dances || O.dances;
        return this._changed();
    }
    // Only adjusts r,g,b
    lighten(percent) {
        if (this.isNull())
            return this;
        percent = Math.min(100, Math.max(0, percent));
        if (percent <= 0)
            return;
        const keepPct = 100 - percent;
        for (let i = 0; i < 3; ++i) {
            this[i] = Math.round((this[i] * keepPct + 100 * percent) / 100);
        }
        return this._changed();
    }
    // Only adjusts r,g,b
    darken(percent) {
        if (this.isNull())
            return this;
        percent = Math.min(100, Math.max(0, percent));
        if (percent <= 0)
            return;
        const keepPct = 100 - percent;
        for (let i = 0; i < 3; ++i) {
            this[i] = Math.round((this[i] * keepPct + 0 * percent) / 100);
        }
        return this._changed();
    }
    bake() {
        if (this.isNull())
            return this;
        const d = this;
        if (d[3] + d[4] + d[5] + d[6]) {
            const rand = this._rand ? Math.floor(options.random() * this._rand) : 0;
            const redRand = this._redRand
                ? Math.floor(options.random() * this._redRand)
                : 0;
            const greenRand = this._greenRand
                ? Math.floor(options.random() * this._greenRand)
                : 0;
            const blueRand = this._blueRand
                ? Math.floor(options.random() * this._blueRand)
                : 0;
            this._r += rand + redRand;
            this._g += rand + greenRand;
            this._b += rand + blueRand;
            for (let i = 3; i < this.length; ++i) {
                this[i] = 0;
            }
            return this._changed();
        }
        return this;
    }
    // Adds a color to this one
    add(other, percent = 100) {
        const O = Color.from(other);
        if (O.isNull())
            return this;
        if (this.isNull()) {
            this.blackOut();
        }
        for (let i = 0; i < this.length; ++i) {
            this[i] += Math.round((O[i] * percent) / 100);
        }
        this.dances = this.dances || O.dances;
        return this._changed();
    }
    scale(percent) {
        if (this.isNull() || percent == 100)
            return this;
        percent = Math.max(0, percent);
        for (let i = 0; i < this.length; ++i) {
            this[i] = Math.round((this[i] * percent) / 100);
        }
        return this._changed();
    }
    multiply(other) {
        if (this.isNull())
            return this;
        let data = other;
        if (!Array.isArray(other)) {
            if (other.isNull())
                return this;
            data = other;
        }
        const len = Math.max(3, Math.min(this.length, data.length));
        for (let i = 0; i < len; ++i) {
            this[i] = Math.round((this[i] * (data[i] || 0)) / 100);
        }
        return this._changed();
    }
    // scales rgb down to a max of 100
    normalize() {
        if (this.isNull())
            return this;
        const max = Math.max(this._r, this._g, this._b);
        if (max <= 100)
            return this;
        this._r = Math.round((100 * this._r) / max);
        this._g = Math.round((100 * this._g) / max);
        this._b = Math.round((100 * this._b) / max);
        return this._changed();
    }
    /**
     * Returns the css code for the current RGB values of the color.
     * @param base256 - Show in base 256 (#abcdef) instead of base 16 (#abc)
     */
    css(base256 = false) {
        const v = this.toInt(base256);
        return "#" + v.toString(16).padStart(base256 ? 6 : 3, "0");
    }
    toString(base256 = false) {
        if (this.name)
            return this.name;
        if (this.isNull())
            return "null color";
        return this.css(base256);
    }
    // adjusts the luminosity of 2 colors to ensure there is enough separation between them
    static separate(a, b) {
        if (a.isNull() || b.isNull())
            return;
        const A = a.clone().clamp();
        const B = b.clone().clamp();
        // console.log('separate');
        // console.log('- a=%s, h=%d, s=%d, l=%d', A.toString(), A.h, A.s, A.l);
        // console.log('- b=%s, h=%d, s=%d, l=%d', B.toString(), B.h, B.s, B.l);
        let hDiff = Math.abs(A.h - B.h);
        if (hDiff > 180) {
            hDiff = 360 - hDiff;
        }
        if (hDiff > 45)
            return; // colors are far enough apart in hue to be distinct
        const dist = 40;
        if (Math.abs(A.l - B.l) >= dist)
            return;
        // Get them sorted by saturation ( we will darken the more saturated color and lighten the other)
        const [lo, hi] = [A, B].sort((a, b) => a.s - b.s);
        // console.log('- lo=%s, hi=%s', lo.toString(), hi.toString());
        while (hi.l - lo.l < dist) {
            hi.mix(WHITE, 5);
            lo.mix(BLACK, 5);
        }
        a.copy(A);
        b.copy(B);
        // console.log('=>', a.toString(), b.toString());
    }
    static swap(a, b) {
        const temp = a.clone();
        a.copy(b);
        b.copy(temp);
    }
    static diff(a, b) {
        return Math.round((a._r - b._r) * (a._r - b._r) * 0.2126 +
            (a._g - b._g) * (a._g - b._g) * 0.7152 +
            (a._b - b._b) * (a._b - b._b) * 0.0722);
    }
}
const BLACK = Color.install("black", 0x000);
const WHITE = Color.install("white", 0xfff);
Color.installSpread("teal", [30, 100, 100]);
Color.installSpread("brown", [60, 40, 0]);
Color.installSpread("tan", [80, 70, 55]); // 80, 67,		15);
Color.installSpread("pink", [100, 60, 66]);
Color.installSpread("gray", [50, 50, 50]);
Color.installSpread("yellow", [100, 100, 0]);
Color.installSpread("purple", [100, 0, 100]);
Color.installSpread("green", [0, 100, 0]);
Color.installSpread("orange", [100, 50, 0]);
Color.installSpread("blue", [0, 0, 100]);
Color.installSpread("red", [100, 0, 0]);
Color.installSpread("amber", [100, 75, 0]);
Color.installSpread("flame", [100, 25, 0]);
Color.installSpread("fuchsia", [100, 0, 100]);
Color.installSpread("magenta", [100, 0, 75]);
Color.installSpread("crimson", [100, 0, 25]);
Color.installSpread("lime", [75, 100, 0]);
Color.installSpread("chartreuse", [50, 100, 0]);
Color.installSpread("sepia", [50, 40, 25]);
Color.installSpread("violet", [50, 0, 100]);
Color.installSpread("han", [25, 0, 100]);
Color.installSpread("cyan", [0, 100, 100]);
Color.installSpread("turquoise", [0, 100, 75]);
Color.installSpread("sea", [0, 100, 50]);
Color.installSpread("sky", [0, 75, 100]);
Color.installSpread("azure", [0, 50, 100]);
Color.installSpread("silver", [75, 75, 75]);
Color.installSpread("gold", [100, 85, 0]);

class DataBuffer {
    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._data = new Uint32Array(width * height);
    }
    get data() {
        return this._data;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get(x, y) {
        let index = y * this.width + x;
        const style = this._data[index] || 0;
        const glyph = style >> 24;
        const bg = (style >> 12) & 0xfff;
        const fg = style & 0xfff;
        return { glyph, fg, bg };
    }
    _toGlyph(ch) {
        if (ch === null || ch === undefined)
            return -1;
        return ch.charCodeAt(0);
    }
    draw(x, y, glyph = -1, fg = -1, bg = -1) {
        let index = y * this.width + x;
        const current = this._data[index] || 0;
        if (typeof glyph !== "number") {
            glyph = this._toGlyph(glyph);
        }
        if (typeof fg !== "number") {
            fg = Color.from(fg).toInt();
        }
        if (typeof bg !== "number") {
            bg = Color.from(bg).toInt();
        }
        glyph = glyph >= 0 ? glyph & 0xff : current >> 24;
        bg = bg >= 0 ? bg & 0xfff : (current >> 12) & 0xfff;
        fg = fg >= 0 ? fg & 0xfff : current & 0xfff;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data[index] = style;
        return this;
    }
    // This is without opacity - opacity must be done in Mixer
    drawSprite(x, y, sprite) {
        let glyph = sprite.ch
            ? sprite.ch
            : sprite.glyph !== undefined
                ? sprite.glyph
                : -1;
        // const fg = sprite.fg ? sprite.fg.toInt() : -1;
        // const bg = sprite.bg ? sprite.bg.toInt() : -1;
        return this.draw(x, y, glyph, sprite.fg, sprite.bg);
    }
    blackOut(x, y) {
        if (arguments.length == 0) {
            return this.fill(0, 0, 0);
        }
        return this.draw(x, y, 0, 0, 0);
    }
    fill(glyph = 0, fg = 0xfff, bg = 0) {
        if (typeof glyph == "string") {
            glyph = this._toGlyph(glyph);
        }
        glyph = glyph & 0xff;
        fg = fg & 0xfff;
        bg = bg & 0xfff;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data.fill(style);
        return this;
    }
    copy(other) {
        this._data.set(other._data);
        return this;
    }
}
class Buffer extends DataBuffer {
    constructor(canvas) {
        super(canvas.width, canvas.height);
        this._canvas = canvas;
        canvas.copyTo(this);
    }
    // get canvas() { return this._canvas; }
    _toGlyph(ch) {
        return this._canvas.glyphs.forChar(ch);
    }
    render() {
        this._canvas.copy(this);
        return this;
    }
    copyFromCanvas() {
        this._canvas.copyTo(this);
        return this;
    }
}

class Mixer {
    constructor() {
        this.ch = -1;
        this.fg = new Color();
        this.bg = new Color();
    }
    _changed() {
        return this;
    }
    copy(other) {
        this.ch = other.ch;
        this.fg.copy(other.fg);
        this.bg.copy(other.bg);
        return this._changed();
    }
    clone() {
        const other = new Mixer();
        other.copy(this);
        return other;
    }
    nullify() {
        this.ch = -1;
        this.fg.nullify();
        this.bg.nullify();
        return this._changed();
    }
    blackOut() {
        this.ch = 0;
        this.fg.blackOut();
        this.bg.blackOut();
        return this._changed();
    }
    draw(ch = -1, fg = -1, bg = -1) {
        if (ch && ch !== -1) {
            this.ch = ch;
        }
        if (fg !== -1 && fg !== null) {
            fg = Color.from(fg);
            this.fg.copy(fg);
        }
        if (bg !== -1 && bg !== null) {
            bg = Color.from(bg);
            this.bg.copy(bg);
        }
        return this._changed();
    }
    drawSprite(info, opacity) {
        if (opacity === undefined)
            opacity = info.opacity;
        if (opacity === undefined)
            opacity = 100;
        if (opacity <= 0)
            return;
        if (info.ch)
            this.ch = info.ch;
        else if (info.glyph !== undefined)
            this.ch = info.glyph;
        if (info.fg)
            this.fg.mix(info.fg, opacity);
        if (info.bg)
            this.bg.mix(info.bg, opacity);
        return this._changed();
    }
    invert() {
        [this.bg, this.fg] = [this.fg, this.bg];
        return this._changed();
    }
    multiply(color, fg = true, bg = true) {
        color = Color.from(color);
        if (fg) {
            this.fg.multiply(color);
        }
        if (bg) {
            this.bg.multiply(color);
        }
        return this._changed();
    }
    mix(color, fg = 50, bg = fg) {
        color = Color.from(color);
        if (fg > 0) {
            this.fg.mix(color, fg);
        }
        if (bg > 0) {
            this.bg.mix(color, bg);
        }
        return this._changed();
    }
    add(color, fg = 100, bg = fg) {
        color = Color.from(color);
        if (fg > 0) {
            this.fg.add(color, fg);
        }
        if (bg > 0) {
            this.bg.add(color, bg);
        }
        return this._changed();
    }
    separate() {
        Color.separate(this.fg, this.bg);
        return this._changed();
    }
    bake() {
        this.fg.bake();
        this.bg.bake();
        this._changed();
        return {
            ch: this.ch,
            fg: this.fg.toInt(),
            bg: this.bg.toInt(),
        };
    }
}

class Sprite {
    constructor(ch, fg, bg, opacity) {
        this.ch = ch;
        this.fg = fg;
        this.bg = bg;
        this.opacity = opacity;
    }
    static make(...args) {
        let ch = null, fg = -1, bg = -1, opacity;
        if (args.length == 0) {
            return new Sprite(null, -1, -1);
        }
        else if (args.length == 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        if (args.length > 1) {
            ch = args[0] || null;
            fg = args[1];
            bg = args[2];
            opacity = args[3];
        }
        else if (args.length == 1) {
            if (typeof args[0] === "string") {
                bg = args[0];
            }
            else {
                const sprite = args[0];
                ch = sprite.ch || null;
                fg = sprite.fg || -1;
                bg = sprite.bg || -1;
                opacity = sprite.opacity;
            }
        }
        if (typeof fg === "string")
            fg = Color.from(fg);
        else if (Array.isArray(fg))
            fg = Color.make(fg);
        else if (fg === undefined || fg === null)
            fg = -1;
        if (typeof bg === "string")
            bg = Color.from(bg);
        else if (Array.isArray(bg))
            bg = Color.make(bg);
        else if (bg === undefined || bg === null)
            bg = -1;
        return new this(ch, fg, bg, opacity);
    }
    static install(name, ...args) {
        let sprite;
        // @ts-ignore
        sprite = this.make(...args);
        sprite.name = name;
        sprites[name] = sprite;
        return sprite;
    }
}
const sprites = {};

exports.Buffer = Buffer;
exports.Canvas = Canvas;
exports.Canvas2D = Canvas2D;
exports.Color = Color;
exports.DataBuffer = DataBuffer;
exports.Glyphs = Glyphs;
exports.Mixer = Mixer;
exports.NotSupportedError = NotSupportedError;
exports.Sprite = Sprite;
exports.colors = colors;
exports.configure = configure;
exports.withFont = withFont;
exports.withImage = withImage;
