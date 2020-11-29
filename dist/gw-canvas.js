'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Copy of: https://github.com/ondras/fastiles/blob/master/ts/utils.ts (v2.1.0)
const QUAD = [
    0, 0, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 1
];
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

// Based on: https://github.com/ondras/fastiles/blob/master/ts/shaders.ts (v2.1.0)
const VS = `
#version 300 es
in uvec2 position;
in uvec2 uv;
in uint style;
out vec2 fsUv;
flat out uint fsStyle;
uniform highp uvec2 tileSize;
uniform uvec2 viewportSize;
void main() {
	ivec2 positionPx = ivec2(position * tileSize);
	vec2 positionNdc = (vec2(positionPx * 2) / vec2(viewportSize))-1.0;
	positionNdc.y *= -1.0;
	gl_Position = vec4(positionNdc, 0.0, 1.0);
	fsUv = vec2(uv);
	fsStyle = style;
}`.trim();
const FS = `
#version 300 es
precision highp float;
in vec2 fsUv;
flat in uint fsStyle;
out vec4 fragColor;
uniform sampler2D font;
uniform highp uvec2 tileSize;
void main() {
	uvec2 fontTiles = uvec2(textureSize(font, 0)) / tileSize;

	uint glyph = (fsStyle & uint(0xFF000000)) >> 24;
	uint glyphX = (glyph & uint(0xF));
	uint glyphY = (glyph >> 4);
	uvec2 fontPosition = uvec2(glyphX, glyphY);

	uvec2 fontPx = (tileSize * fontPosition) + uvec2(vec2(tileSize) * fsUv);
	vec3 texel = texelFetch(font, ivec2(fontPx), 0).rgb;

	float s = 15.0;
	uint fr = (fsStyle & uint(0xF00)) >> 8;
	uint fg = (fsStyle & uint(0x0F0)) >> 4;
	uint fb = (fsStyle & uint(0x00F)) >> 0;
	vec3 fgRgb = vec3(fr, fg, fb) / s;
  
	uint br = (fsStyle & uint(0xF00000)) >> 20;
	uint bg = (fsStyle & uint(0x0F0000)) >> 16;
	uint bb = (fsStyle & uint(0x00F000)) >> 12;
	vec3 bgRgb = vec3(br, bg, bb) / s;
  
	fragColor = vec4(mix(bgRgb, fgRgb, texel), 1.0);
}`.trim();

// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)
const VERTICES_PER_TILE = 6;
class Canvas {
    constructor(options) {
        this._data = new Uint32Array();
        this._buffers = {};
        this._attribs = {};
        this._uniforms = {};
        this._renderRequested = false;
        this._autoRender = true;
        this._width = 50;
        this._height = 25;
        if (!options.glyphs)
            throw new Error('You must supply glyphs for the canvas.');
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
    get glyphs() { return this._glyphs; }
    set glyphs(glyphs) {
        const gl = this._gl;
        const uniforms = this._uniforms;
        if (glyphs === this._glyphs && !glyphs.needsUpdate)
            return;
        if (glyphs !== this._glyphs) {
            this._glyphs = glyphs;
            this.resize(this._width, this._height);
            gl.uniform2uiv(uniforms["tileSize"], [this.tileWidth, this.tileHeight]);
        }
        this.uploadGlyphs();
    }
    _configure(options) {
        this._width = options.width || this._width;
        this._height = options.height || this._height;
        this._autoRender = (options.render !== false);
        this.glyphs = options.glyphs;
    }
    resize(width, height) {
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
    draw(x, y, glyph, fg, bg) {
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
    _initGL(node) {
        if (typeof node === 'string') {
            const el = document.getElementById(node);
            if (!el)
                throw new Error('Failed to find canvas with id:' + node);
            if (!(el instanceof HTMLCanvasElement))
                throw new Error('Canvas: node must be a canvas element.');
            node = el;
        }
        else if (!node) {
            node = document.createElement("canvas");
        }
        let gl = node.getContext("webgl2");
        if (!gl) {
            throw new Error("WebGL 2 not supported");
        }
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
        return gl;
    }
    _createGeometry() {
        const gl = this._gl;
        this._buffers.position && gl.deleteBuffer(this._buffers.position);
        this._buffers.uv && gl.deleteBuffer(this._buffers.uv);
        let buffers = createGeometry(gl, this._attribs, this._width, this._height);
        Object.assign(this._buffers, buffers);
    }
    _createData() {
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
    _requestRender() {
        if (this._renderRequested || !this._autoRender) {
            return;
        }
        this._renderRequested = true;
        requestAnimationFrame(() => this._render());
    }
    _render() {
        const gl = this._gl;
        if (this._glyphs.needsUpdate) { // auto keep glyphs up to date
            this.uploadGlyphs();
        }
        this._renderRequested = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.style);
        gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, this._width * this._height * VERTICES_PER_TILE);
    }
    uploadGlyphs() {
        if (!this._glyphs.needsUpdate)
            return;
        const gl = this._gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._glyphs.node);
        this._requestRender();
        this._glyphs.needsUpdate = false;
    }
}
function createGeometry(gl, attribs, width, height) {
    let tileCount = width * height;
    let positionData = new Uint16Array(tileCount * QUAD.length);
    let uvData = new Uint8Array(tileCount * QUAD.length);
    let i = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            QUAD.forEach(value => {
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

class Glyphs {
    constructor(opts = {}) {
        this._tileWidth = 12;
        this._tileHeight = 16;
        this.needsUpdate = true;
        this._map = {};
        opts.font = opts.font || 'monospace';
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
        const glyph = new this();
        glyph.node.width = src.width;
        glyph.node.height = src.height;
        glyph._tileWidth = src.width / 16;
        glyph._tileHeight = src.height / 16;
        glyph._ctx.drawImage(src, 0, 0);
        glyph.needsUpdate = true;
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
    // get width() { return 16; }
    // get height() { return 16; }
    get tileWidth() { return this._tileWidth; }
    get tileHeight() { return this._tileHeight; }
    get pxWidth() { return this.node.width; }
    get pxHeight() { return this.node.height; }
    forChar(ch) { return this._map[ch] || 0; }
    _configure(opts) {
        this.node = document.createElement('canvas');
        this._ctx = this.node.getContext('2d');
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
            [
                '\u2302',
                '\u2b09', '\u272a', '\u2718', '\u2610', '\u2611', '\u25ef', '\u25ce', '\u2690',
                '\u2691', '\u2598', '\u2596', '\u259d', '\u2597', '\u2744', '\u272d', '\u2727',
                '\u25e3', '\u25e4', '\u25e2', '\u25e5', '\u25a8', '\u25a7', '\u259a', '\u265f',
                '\u265c', '\u265e', '\u265d', '\u265b', '\u265a', '\u301c', '\u2694', '\u2692',
                '\u25b6', '\u25bc', '\u25c0', '\u25b2', '\u25a4', '\u25a5', '\u25a6', '\u257a',
                '\u257b', '\u2578', '\u2579', '\u2581', '\u2594', '\u258f', '\u2595', '\u272d',
                '\u2591', '\u2592', '\u2593', '\u2503', '\u252b', '\u2561', '\u2562', '\u2556',
                '\u2555', '\u2563', '\u2551', '\u2557', '\u255d', '\u255c', '\u255b', '\u2513',
                '\u2517', '\u253b', '\u2533', '\u2523', '\u2501', '\u254b', '\u255e', '\u255f',
                '\u255a', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256c', '\u2567',
                '\u2568', '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256b',
                '\u256a', '\u251b', '\u250f', '\u2588', '\u2585', '\u258c', '\u2590', '\u2580',
                '\u03b1', '\u03b2', '\u0393', '\u03c0', '\u03a3', '\u03c3', '\u03bc', '\u03c4',
                '\u03a6', '\u03b8', '\u03a9', '\u03b4', '\u221e', '\u03b8', '\u03b5', '\u03b7',
                '\u039e', '\u00b1', '\u2265', '\u2264', '\u2234', '\u2237', '\u00f7', '\u2248',
                '\u22c4', '\u22c5', '\u2217', '\u27b5', '\u2620', '\u2625', '\u25fc', '\u25fb'
            ].forEach((ch, i) => {
                this.draw(i + 127, ch);
            });
        }
    }
}

class Buffer {
    constructor(canvas) {
        this._canvas = canvas;
        this._data = new Uint32Array(canvas.width * canvas.height);
        canvas.copyTo(this);
    }
    get data() { return this._data; }
    get width() { return this._canvas.width; }
    get height() { return this._canvas.height; }
    get(x, y) {
        let index = y * this.width + x;
        const style = this._data[index] || 0;
        const glyph = (style >> 24);
        const bg = (style >> 12) & 0xFFF;
        const fg = (style & 0xFFF);
        return { glyph, fg, bg };
    }
    draw(x, y, glyph = -1, fg = -1, bg = -1) {
        let index = y * this.width + x;
        const current = this._data[index] || 0;
        if (typeof glyph == 'string') {
            glyph = this._canvas.glyphs.forChar(glyph);
        }
        glyph = (glyph >= 0) ? (glyph & 0xFF) : (current >> 24);
        bg = (bg >= 0) ? (bg & 0xFFF) : ((current >> 12) & 0xFFF);
        fg = (fg >= 0) ? (fg & 0xFFF) : (current & 0xFFF);
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data[index] = style;
    }
    fill(bg = 0, glyph = 0, fg = 0xFFF) {
        if (typeof glyph == 'string') {
            glyph = this._canvas.glyphs.forChar(glyph);
        }
        glyph = glyph & 0xFF;
        bg = bg & 0xFFF;
        fg = fg & 0xFFF;
        const style = (glyph << 24) + (bg << 12) + fg;
        this._data.fill(style);
    }
    copy(other) {
        this._data.set(other._data);
    }
    render() {
        this._canvas.copy(this);
    }
    copyFromCanvas() {
        this._canvas.copyTo(this);
    }
}

function withImage(image) {
    let opts = {};
    if (typeof image === 'string') {
        opts.glyphs = Glyphs.fromImage(image);
    }
    else if (image instanceof HTMLImageElement) {
        opts.glyphs = Glyphs.fromImage(image);
    }
    else {
        if (!image.image)
            throw new Error('You must supply the image.');
        Object.assign(opts, image);
        opts.glyphs = Glyphs.fromImage(image.image);
    }
    return new Canvas(opts);
}
function withFont(src) {
    if (typeof src === 'string') {
        src = { font: src };
    }
    src.glyphs = Glyphs.fromFont(src);
    return new Canvas(src);
}

exports.Buffer = Buffer;
exports.Canvas = Canvas;
exports.Glyphs = Glyphs;
exports.withFont = withFont;
exports.withImage = withImage;
