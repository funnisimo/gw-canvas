// Based on: https://github.com/ondras/fastiles/blob/master/ts/scene.ts (v2.1.0)
import * as shaders from "./shaders";
import { Glyphs } from "./glyphs";
import { Layer } from "./layer";
import * as Color from "./color";
export const VERTICES_PER_TILE = 6;
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
        this.name = "NotSupportedError";
    }
}
export class Canvas {
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
        this.bg = Color.from(options.bg || Color.BLACK);
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
        const gl = this._gl;
        const uniforms = this._uniforms;
        gl.uniform2uiv(uniforms["tileSize"], [this.tileWidth, this.tileHeight]);
        this._uploadGlyphs();
        return true;
    }
    resize(width, height) {
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
        this._buffers.fg && gl.deleteBuffer(this._buffers.fg);
        this._buffers.bg && gl.deleteBuffer(this._buffers.bg);
        this._buffers.glyph && gl.deleteBuffer(this._buffers.glyph);
        this.layer = new Layer(this);
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
    draw(x, y, glyph, fg, bg) {
        this.layer.draw(x, y, glyph, fg, bg);
        this._requestRender();
        return true;
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
        // clear to bg color?
        gl.clearColor(this.bg.r / 100, this.bg.g / 100, this.bg.b / 100, this.bg.a / 100);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // loop layers
        // set depth
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.fg);
        gl.bufferData(gl.ARRAY_BUFFER, this.layer.fg, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.bg);
        gl.bufferData(gl.ARRAY_BUFFER, this.layer.bg, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.glyph);
        gl.bufferData(gl.ARRAY_BUFFER, this.layer.glyph, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, this._width * this._height * VERTICES_PER_TILE);
        // end loop
    }
}
export function withImage(image) {
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
    return new Canvas(opts);
}
export function withFont(src) {
    if (typeof src === "string") {
        src = { font: src };
    }
    src.glyphs = Glyphs.fromFont(src);
    return new Canvas(src);
}
// Copy of: https://github.com/ondras/fastiles/blob/master/ts/utils.ts (v2.1.0)
export function createProgram(gl, ...sources) {
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
export const QUAD = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
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
