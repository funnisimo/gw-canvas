// Based on: https://github.com/ondras/fastiles/blob/master/ts/shaders.ts (v2.1.0)
const VS = `
#version 300 es

in vec2 position;
in uvec2 offset;
in uint fg;
in uint bg;
in uint glyph;

out vec2 fsOffset;
out vec3 fgRgb;
out vec3 bgRgb;
flat out uvec2 fontPos;

void main() {
	gl_Position = vec4(position, 0.0, 1.0);

	float fgr = float((fg & uint(0xF00)) >> 8);
	float fgg = float((fg & uint(0x0F0)) >> 4);
	float fgb = float(fg & uint(0x00F));
	fgRgb = vec3(fgr, fgg, fgb) / 15.0;
  
	float bgr = float((bg & uint(0xF00)) >> 8);
	float bgg = float((bg & uint(0x0F0)) >> 4);
	float bgb = float((bg & uint(0x00F)));
	bgRgb = vec3(bgr, bgg, bgb) / 15.0;

	uint glyphX = (glyph & uint(0xF));
	uint glyphY = (glyph >> 4);
	fontPos = uvec2(glyphX, glyphY);

	fsOffset = vec2(offset);
}`.trim();
const FS = `
#version 300 es
precision highp float;

in vec2 fsOffset;
in vec3 fgRgb;
in vec3 bgRgb;
flat in uvec2 fontPos;

out vec4 fragColor;

uniform sampler2D font;
uniform uvec2 tileSize;

void main() {
	uvec2 fontPx = (tileSize * fontPos) + uvec2(vec2(tileSize) * fsOffset);
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

const colors = {};
function clamp$1(v, n, x) {
    return Math.max(n, Math.min(x, v));
}
// All colors are const!!!
class Color {
    // values are 0-100 for normal RGBA
    constructor(r = -1, g = 0, b = 0, a = 100) {
        if (r < 0) {
            a = 0;
            r = 0;
        }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    rgb() {
        return [this.r, this.g, this.b];
    }
    rgba() {
        return [this.r, this.g, this.b, this.a];
    }
    isNull() {
        return this.a === 0;
    }
    alpha(v) {
        return new Color(this.r, this.g, this.b, clamp$1(v, 0, 100));
    }
    // luminosity (0-100)
    get l() {
        return Math.round(0.5 *
            (Math.min(this.r, this.g, this.b) + Math.max(this.r, this.g, this.b)));
    }
    // saturation (0-100)
    get s() {
        if (this.l >= 100)
            return 0;
        return Math.round(((Math.max(this.r, this.g, this.b) - Math.min(this.r, this.g, this.b)) *
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
    equals(other) {
        if (typeof other === "string") {
            if (other.startsWith("#")) {
                if (other.length == 4) {
                    return this.css() === other;
                }
            }
            if (this.name && this.name === other)
                return true;
        }
        else if (typeof other === "number") {
            if (other < 0x1000)
                return this.toInt() === other;
        }
        const O = from(other);
        if (this.isNull())
            return O.isNull();
        if (O.isNull())
            return false;
        return this.r === O.r && this.g === O.g && this.b === O.b && this.a === O.a;
    }
    toInt() {
        if (this.isNull())
            return -1;
        const r = Math.max(0, Math.min(15, Math.round((this.r / 100) * 15)));
        const g = Math.max(0, Math.min(15, Math.round((this.g / 100) * 15)));
        const b = Math.max(0, Math.min(15, Math.round((this.b / 100) * 15)));
        // TODO - alpha
        return (r << 8) + (g << 4) + b;
    }
    toLight() {
        return this.rgb();
    }
    clamp() {
        if (this.isNull())
            return this;
        return make([
            clamp$1(this.r, 0, 100),
            clamp$1(this.g, 0, 100),
            clamp$1(this.b, 0, 100),
            clamp$1(this.a, 0, 100),
        ]);
    }
    blend(other) {
        const O = from(other);
        if (O.isNull())
            return this;
        if (O.a === 100)
            return O;
        const pct = O.a / 100;
        const keepPct = 1 - pct;
        const newColor = make(Math.round(this.r * keepPct + O.r * pct), Math.round(this.g * keepPct + O.g * pct), Math.round(this.b * keepPct + O.b * pct), Math.round(O.a + this.a * keepPct));
        return newColor;
    }
    mix(other, percent) {
        const O = from(other);
        if (O.isNull())
            return this;
        if (percent >= 100)
            return O;
        const pct = clamp$1(percent, 0, 100) / 100;
        const keepPct = 1 - pct;
        const newColor = make(Math.round(this.r * keepPct + O.r * pct), Math.round(this.g * keepPct + O.g * pct), Math.round(this.b * keepPct + O.b * pct), (this.isNull() ? 100 : this.a) * keepPct + O.a * pct);
        return newColor;
    }
    // Only adjusts r,g,b
    lighten(percent) {
        if (this.isNull())
            return this;
        if (percent <= 0)
            return this;
        const pct = clamp$1(percent, 0, 100) / 100;
        const keepPct = 1 - pct;
        return make(Math.round(this.r * keepPct + 100 * pct), Math.round(this.g * keepPct + 100 * pct), Math.round(this.b * keepPct + 100 * pct), this.a);
    }
    // Only adjusts r,g,b
    darken(percent) {
        if (this.isNull())
            return this;
        const pct = clamp$1(percent, 0, 100) / 100;
        const keepPct = 1 - pct;
        return make(Math.round(this.r * keepPct + 0 * pct), Math.round(this.g * keepPct + 0 * pct), Math.round(this.b * keepPct + 0 * pct), this.a);
    }
    bake(_clearDancing = false) {
        return this;
    }
    // Adds a color to this one
    add(other, percent = 100) {
        const O = from(other);
        if (O.isNull())
            return this;
        const alpha = (O.a / 100) * (percent / 100);
        return new Color(Math.round(this.r + O.r * alpha), Math.round(this.g + O.g * alpha), Math.round(this.b + O.b * alpha), clamp$1(Math.round(this.a + alpha * 100), 0, 100));
    }
    scale(percent) {
        if (this.isNull() || percent == 100)
            return this;
        const pct = Math.max(0, percent) / 100;
        return make(Math.round(this.r * pct), Math.round(this.g * pct), Math.round(this.b * pct), this.a);
    }
    multiply(other) {
        if (this.isNull())
            return this;
        let data;
        if (Array.isArray(other)) {
            if (other.length < 3)
                throw new Error("requires at least r,g,b values.");
            data = other;
        }
        else {
            if (other.isNull())
                return this;
            data = other.rgb();
        }
        const pct = (data[3] || 100) / 100;
        return make(Math.round(this.r * (data[0] / 100) * pct), Math.round(this.g * (data[1] / 100) * pct), Math.round(this.b * (data[2] / 100) * pct), 100);
    }
    // scales rgb down to a max of 100
    normalize() {
        if (this.isNull())
            return this;
        const max = Math.max(this.r, this.g, this.b);
        if (max <= 100)
            return this;
        return make(Math.round((100 * this.r) / max), Math.round((100 * this.g) / max), Math.round((100 * this.b) / max), 100);
    }
    /**
     * Returns the css code for the current RGB values of the color.
     * @param base256 - Show in base 256 (#abcdef) instead of base 16 (#abc)
     */
    css() {
        const v = this.toInt();
        if (v < 0)
            return "transparent";
        return "#" + v.toString(16).padStart(3, "0");
    }
    toString() {
        if (this.name)
            return this.name;
        if (this.isNull())
            return "null color";
        return this.css();
    }
}
function fromArray(vals, base256 = false) {
    while (vals.length < 3)
        vals.push(0);
    if (base256) {
        for (let i = 0; i < 3; ++i) {
            vals[i] = Math.round(((vals[i] || 0) * 100) / 255);
        }
    }
    return new Color(...vals);
}
function fromCss(css) {
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
    return new Color(r, g, b);
}
function fromName(name) {
    const c = colors[name];
    if (!c) {
        throw new Error("Unknown color name: " + name);
    }
    return c;
}
function fromNumber(val, base256 = false) {
    if (val < 0) {
        return new Color();
    }
    else if (base256 || val > 0xfff) {
        return new Color(Math.round((((val & 0xff0000) >> 16) * 100) / 255), Math.round((((val & 0xff00) >> 8) * 100) / 255), Math.round(((val & 0xff) * 100) / 255), 100);
    }
    else {
        return new Color(Math.round((((val & 0xf00) >> 8) * 100) / 15), Math.round((((val & 0xf0) >> 4) * 100) / 15), Math.round(((val & 0xf) * 100) / 15), 100);
    }
}
function make(...args) {
    let arg = args[0];
    let base256 = args[1];
    if (args.length == 0)
        return new Color();
    if (args.length > 2) {
        arg = args;
        base256 = false; // TODO - Change this!!!
    }
    if (arg === undefined || arg === null)
        return new Color(-1);
    if (arg instanceof Color) {
        return arg;
    }
    if (typeof arg === "string") {
        if (arg.startsWith("#")) {
            return fromCss(arg);
        }
        return fromName(arg);
    }
    else if (Array.isArray(arg)) {
        return fromArray(arg, base256);
    }
    else if (typeof arg === "number") {
        return fromNumber(arg, base256);
    }
    throw new Error("Failed to make color - unknown argument: " + JSON.stringify(arg));
}
function from(...args) {
    const arg = args[0];
    if (arg instanceof Color)
        return arg;
    if (arg === undefined)
        return new Color(-1);
    if (typeof arg === "string") {
        if (!arg.startsWith("#")) {
            return fromName(arg);
        }
    }
    return make(arg, args[1]);
}
// adjusts the luminosity of 2 colors to ensure there is enough separation between them
function separate(a, b) {
    if (a.isNull() || b.isNull())
        return [a, b];
    const A = a.clamp();
    const B = b.clamp();
    // console.log('separate');
    // console.log('- a=%s, h=%d, s=%d, l=%d', A.toString(), A.h, A.s, A.l);
    // console.log('- b=%s, h=%d, s=%d, l=%d', B.toString(), B.h, B.s, B.l);
    let hDiff = Math.abs(A.h - B.h);
    if (hDiff > 180) {
        hDiff = 360 - hDiff;
    }
    if (hDiff > 45)
        return [A, B]; // colors are far enough apart in hue to be distinct
    const dist = 40;
    if (Math.abs(A.l - B.l) >= dist)
        return [A, B];
    // Get them sorted by saturation ( we will darken the more saturated color and lighten the other)
    const out = [A, B];
    const lo = A.s <= B.s ? 0 : 1;
    const hi = 1 - lo;
    // console.log('- lo=%s, hi=%s', lo.toString(), hi.toString());
    while (out[hi].l - out[lo].l < dist) {
        out[hi] = out[hi].mix(WHITE, 5);
        out[lo] = out[lo].mix(BLACK, 5);
    }
    // console.log('=>', a.toString(), b.toString());
    return out;
}
function relativeLuminance(a, b) {
    return Math.round((100 *
        ((a.r - b.r) * (a.r - b.r) * 0.2126 +
            (a.g - b.g) * (a.g - b.g) * 0.7152 +
            (a.b - b.b) * (a.b - b.b) * 0.0722)) /
        10000);
}
function distance(a, b) {
    return Math.round((100 *
        ((a.r - b.r) * (a.r - b.r) * 0.3333 +
            (a.g - b.g) * (a.g - b.g) * 0.3333 +
            (a.b - b.b) * (a.b - b.b) * 0.3333)) /
        10000);
}
// Draws the smooth gradient that appears on a button when you hover over or depress it.
// Returns the percentage by which the current tile should be averaged toward a hilite color.
function smoothScalar(rgb, maxRgb = 100) {
    return Math.floor(100 * Math.sin((Math.PI * rgb) / maxRgb));
}
function install(name, ...args) {
    let info = args;
    if (args.length == 1) {
        info = args[0];
    }
    const c = info instanceof Color ? info : make(info);
    // @ts-ignore
    c._const = true;
    colors[name] = c;
    c.name = name;
    return c;
}
function installSpread(name, ...args) {
    let c;
    if (args.length == 1) {
        c = install(name, args[0]);
    }
    else {
        c = install(name, ...args);
    }
    install("light_" + name, c.lighten(25));
    install("lighter_" + name, c.lighten(50));
    install("lightest_" + name, c.lighten(75));
    install("dark_" + name, c.darken(25));
    install("darker_" + name, c.darken(50));
    install("darkest_" + name, c.darken(75));
    return c;
}
const NONE = install("NONE", -1);
const BLACK = install("black", 0x000);
const WHITE = install("white", 0xfff);
installSpread("teal", [30, 100, 100]);
installSpread("brown", [60, 40, 0]);
installSpread("tan", [80, 70, 55]); // 80, 67,		15);
installSpread("pink", [100, 60, 66]);
installSpread("gray", [50, 50, 50]);
installSpread("yellow", [100, 100, 0]);
installSpread("purple", [100, 0, 100]);
installSpread("green", [0, 100, 0]);
installSpread("orange", [100, 50, 0]);
installSpread("blue", [0, 0, 100]);
installSpread("red", [100, 0, 0]);
installSpread("amber", [100, 75, 0]);
installSpread("flame", [100, 25, 0]);
installSpread("fuchsia", [100, 0, 100]);
installSpread("magenta", [100, 0, 75]);
installSpread("crimson", [100, 0, 25]);
installSpread("lime", [75, 100, 0]);
installSpread("chartreuse", [50, 100, 0]);
installSpread("sepia", [50, 40, 25]);
installSpread("violet", [50, 0, 100]);
installSpread("han", [25, 0, 100]);
installSpread("cyan", [0, 100, 100]);
installSpread("turquoise", [0, 100, 75]);
installSpread("sea", [0, 100, 50]);
installSpread("sky", [0, 75, 100]);
installSpread("azure", [0, 50, 100]);
installSpread("silver", [75, 75, 75]);
installSpread("gold", [100, 85, 0]);

var color = /*#__PURE__*/Object.freeze({
	__proto__: null,
	colors: colors,
	Color: Color,
	fromArray: fromArray,
	fromCss: fromCss,
	fromName: fromName,
	fromNumber: fromNumber,
	make: make,
	from: from,
	separate: separate,
	relativeLuminance: relativeLuminance,
	distance: distance,
	smoothScalar: smoothScalar,
	install: install,
	installSpread: installSpread,
	NONE: NONE,
	BLACK: BLACK,
	WHITE: WHITE
});

class Layer {
    constructor(canvas) {
        const size = canvas.width * canvas.height * VERTICES_PER_TILE;
        this.canvas = canvas;
        this.fg = new Uint16Array(size);
        this.bg = new Uint16Array(size);
        this.glyph = new Uint8Array(size);
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
    draw(x, y, glyph, fg = 0xfff, bg = 0x000) {
        const index = x + y * this.canvas.width;
        if (typeof glyph === "string") {
            glyph = this.canvas.glyphs.forChar(glyph);
        }
        if (typeof fg !== "number") {
            fg = from(fg).toInt();
        }
        if (typeof bg !== "number") {
            bg = from(bg).toInt();
        }
        this.set(index, glyph, fg, bg);
    }
    set(index, glyph, fg, bg) {
        index *= VERTICES_PER_TILE;
        glyph = glyph & 0xff;
        bg = bg & 0xffff;
        fg = fg & 0xffff;
        for (let i = 0; i < VERTICES_PER_TILE; ++i) {
            this.glyph[index + i] = glyph;
            this.fg[index + i] = fg;
            this.bg[index + i] = bg;
        }
    }
    //   forEach(
    //     cb: (i: number, glyph: number, fg: number, bg: number) => void
    //   ): void {
    //     for (let i = 0; i < this.glyph.length; ++i) {
    //       cb(i, this.glyph[i], this.fg[i], this.bg[i]);
    //     }
    //   }
    copy(buffer) {
        buffer._data.forEach((mixer, i) => {
            let glyph = mixer.ch;
            if (typeof glyph === "string") {
                glyph = this.canvas.glyphs.forChar(glyph);
            }
            this.set(i, glyph, mixer.fg.toInt(), mixer.bg.toInt());
        });
        this.canvas._requestRender();
    }
    copyTo(buffer) {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const index = (x + y * this.width) * VERTICES_PER_TILE;
                buffer.draw(x, y, this.glyph[index], this.fg[index], this.bg[index]);
            }
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
class Canvas {
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
        this.bg = from(options.bg || BLACK);
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
    return new Canvas(opts);
}
function withFont(src) {
    if (typeof src === "string") {
        src = { font: src };
    }
    src.glyphs = Glyphs.fromFont(src);
    return new Canvas(src);
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

class Mixer {
    constructor(base = {}) {
        this.ch = base.ch || 0;
        this.fg = make(base.fg);
        this.bg = make(base.bg);
    }
    _changed() {
        return this;
    }
    copy(other) {
        this.ch = other.ch || -1;
        this.fg = from(other.fg);
        this.bg = from(other.bg);
        return this._changed();
    }
    clone() {
        const other = new Mixer();
        other.copy(this);
        return other;
    }
    equals(other) {
        return (this.ch == other.ch &&
            this.fg.equals(other.fg) &&
            this.bg.equals(other.bg));
    }
    // get dances(): boolean {
    //   return this.fg.dances || this.bg.dances;
    // }
    nullify() {
        this.ch = -1;
        this.fg = NONE;
        this.bg = NONE;
        return this._changed();
    }
    blackOut() {
        this.ch = -1;
        this.fg = BLACK;
        this.bg = BLACK;
        return this._changed();
    }
    draw(ch = -1, fg = -1, bg = -1) {
        if (ch && ch !== -1) {
            this.ch = ch;
        }
        if (fg !== -1 && fg !== null) {
            fg = from(fg);
            this.fg = this.fg.blend(fg);
        }
        if (bg !== -1 && bg !== null) {
            bg = from(bg);
            this.bg = this.bg.blend(bg);
        }
        return this._changed();
    }
    drawSprite(src, opacity) {
        if (src === this)
            return this;
        // @ts-ignore
        if (opacity === undefined)
            opacity = src.opacity;
        if (opacity === undefined)
            opacity = 100;
        if (opacity <= 0)
            return;
        if (src.ch)
            this.ch = src.ch;
        if ((src.fg && src.fg !== -1) || src.fg === 0)
            this.fg = this.fg.mix(src.fg, opacity);
        if ((src.bg && src.bg !== -1) || src.bg === 0)
            this.bg = this.bg.mix(src.bg, opacity);
        return this._changed();
    }
    invert() {
        [this.bg, this.fg] = [this.fg, this.bg];
        return this._changed();
    }
    multiply(color$1, fg = true, bg = true) {
        color$1 = from(color$1);
        if (fg) {
            this.fg = this.fg.multiply(color$1);
        }
        if (bg) {
            this.bg = this.bg.multiply(color$1);
        }
        return this._changed();
    }
    scale(multiplier, fg = true, bg = true) {
        if (fg)
            this.fg = this.fg.scale(multiplier);
        if (bg)
            this.bg = this.bg.scale(multiplier);
        return this._changed();
    }
    mix(color$1, fg = 50, bg = fg) {
        color$1 = from(color$1);
        if (fg > 0) {
            this.fg = this.fg.mix(color$1, fg);
        }
        if (bg > 0) {
            this.bg = this.bg.mix(color$1, bg);
        }
        return this._changed();
    }
    add(color$1, fg = 100, bg = fg) {
        color$1 = from(color$1);
        if (fg > 0) {
            this.fg = this.fg.add(color$1, fg);
        }
        if (bg > 0) {
            this.bg = this.bg.add(color$1, bg);
        }
        return this._changed();
    }
    separate() {
        [this.fg, this.bg] = separate(this.fg, this.bg);
        return this._changed();
    }
    bake(clearDancing = false) {
        this.fg = this.fg.bake(clearDancing);
        this.bg = this.bg.bake(clearDancing);
        this._changed();
        return {
            ch: this.ch,
            fg: this.fg.toInt(),
            bg: this.bg.toInt(),
        };
    }
    toString() {
        // prettier-ignore
        return `{ ch: ${this.ch}, fg: ${this.fg.toString()}, bg: ${this.bg.toString()} }`;
    }
}

class DataBuffer {
    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._data = [];
        for (let i = 0; i < width * height; ++i) {
            this._data.push(new Mixer());
        }
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get(x, y) {
        let index = y * this.width + x;
        return this._data[index];
    }
    _toGlyph(ch) {
        if (ch === null || ch === undefined)
            return -1;
        return ch.charCodeAt(0);
    }
    draw(x, y, glyph = -1, fg = -1, bg = -1) {
        let index = y * this.width + x;
        const current = this._data[index];
        current.draw(glyph, fg, bg);
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
        this._data.forEach((m) => m.draw(glyph, fg, bg));
        return this;
    }
    copy(other) {
        this._data.forEach((m, i) => {
            m.copy(other._data[i]);
        });
        return this;
    }
}
class Buffer extends DataBuffer {
    constructor(layer) {
        super(layer.width, layer.height);
        this._layer = layer;
        layer.copyTo(this);
    }
    // get canvas() { return this._canvas; }
    _toGlyph(ch) {
        return this._layer.canvas.glyphs.forChar(ch);
    }
    render() {
        this._layer.copy(this);
        return this;
    }
    copyFromCanvas() {
        this._layer.copyTo(this);
        return this;
    }
}

var options = {
    random: Math.random.bind(Math),
};
function configure(opts = {}) {
    Object.assign(options, opts);
}

function clamp(v, n, x) {
    return Math.min(x, Math.max(n, v));
}
class Sprite {
    constructor(ch, fg, bg, opacity = 100) {
        if (!ch)
            ch = null;
        this.ch = ch;
        this.fg = from(fg);
        this.bg = from(bg);
        this.opacity = clamp(opacity, 0, 100);
    }
    clone() {
        return new Sprite(this.ch, this.fg, this.bg, this.opacity);
    }
    toString() {
        const parts = [];
        if (this.ch)
            parts.push("ch: " + this.ch);
        if (!this.fg.isNull())
            parts.push("fg: " + this.fg.toString());
        if (!this.bg.isNull())
            parts.push("bg: " + this.bg.toString());
        if (this.opacity !== 100)
            parts.push("opacity: " + this.opacity);
        return "{ " + parts.join(", ") + " }";
    }
}

export { Buffer, Canvas, DataBuffer, Glyphs, Layer, Mixer, NotSupportedError, Sprite, color, configure, withFont, withImage };
