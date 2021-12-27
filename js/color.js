export const colors = {};
function clamp(v, n, x) {
    return Math.max(n, Math.min(x, v));
}
// All colors are const!!!
export class Color {
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
        return new Color(this.r, this.g, this.b, clamp(v, 0, 100));
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
            const O = from(other);
            return this.css() === O.css();
        }
        const O = from(other);
        if (this.isNull())
            return O.isNull();
        if (O.isNull())
            return false;
        return this.r === O.r && this.g === O.g && this.b === O.b && this.a === O.a;
    }
    toInt() {
        // if (this.isNull()) return -1;
        const r = Math.max(0, Math.min(15, Math.round((this.r / 100) * 15)));
        const g = Math.max(0, Math.min(15, Math.round((this.g / 100) * 15)));
        const b = Math.max(0, Math.min(15, Math.round((this.b / 100) * 15)));
        const a = Math.max(0, Math.min(15, Math.round((this.a / 100) * 15)));
        // TODO - alpha
        return (r << 12) + (g << 8) + (b << 4) + a;
    }
    toLight() {
        return this.rgb();
    }
    clamp() {
        if (this.isNull())
            return this;
        return make([
            clamp(this.r, 0, 100),
            clamp(this.g, 0, 100),
            clamp(this.b, 0, 100),
            clamp(this.a, 0, 100),
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
        const pct = clamp(percent, 0, 100) / 100;
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
        const pct = clamp(percent, 0, 100) / 100;
        const keepPct = 1 - pct;
        return make(Math.round(this.r * keepPct + 100 * pct), Math.round(this.g * keepPct + 100 * pct), Math.round(this.b * keepPct + 100 * pct), this.a);
    }
    // Only adjusts r,g,b
    darken(percent) {
        if (this.isNull())
            return this;
        const pct = clamp(percent, 0, 100) / 100;
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
        return new Color(Math.round(this.r + O.r * alpha), Math.round(this.g + O.g * alpha), Math.round(this.b + O.b * alpha), clamp(Math.round(this.a + alpha * 100), 0, 100));
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
        if (this.a !== 100) {
            const v = this.toInt();
            // if (v < 0) return "transparent";
            return "#" + v.toString(16).padStart(4, "0");
        }
        const v = this.toInt();
        // if (v < 0) return "transparent";
        return "#" + v.toString(16).padStart(4, "0").substring(0, 3);
    }
    toString() {
        if (this.name)
            return this.name;
        // if (this.isNull()) return "null color";
        return this.css();
    }
}
export function fromArray(vals, base256 = false) {
    while (vals.length < 3)
        vals.push(0);
    if (base256) {
        for (let i = 0; i < 3; ++i) {
            vals[i] = Math.round(((vals[i] || 0) * 100) / 255);
        }
    }
    return new Color(...vals);
}
export function fromCss(css) {
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
export function fromName(name) {
    const c = colors[name];
    if (!c) {
        throw new Error("Unknown color name: " + name);
    }
    return c;
}
export function fromNumber(val, base256 = false) {
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
export function make(...args) {
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
export function from(...args) {
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
export function separate(a, b) {
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
export function relativeLuminance(a, b) {
    return Math.round((100 *
        ((a.r - b.r) * (a.r - b.r) * 0.2126 +
            (a.g - b.g) * (a.g - b.g) * 0.7152 +
            (a.b - b.b) * (a.b - b.b) * 0.0722)) /
        10000);
}
export function distance(a, b) {
    return Math.round((100 *
        ((a.r - b.r) * (a.r - b.r) * 0.3333 +
            (a.g - b.g) * (a.g - b.g) * 0.3333 +
            (a.b - b.b) * (a.b - b.b) * 0.3333)) /
        10000);
}
// Draws the smooth gradient that appears on a button when you hover over or depress it.
// Returns the percentage by which the current tile should be averaged toward a hilite color.
export function smoothScalar(rgb, maxRgb = 100) {
    return Math.floor(100 * Math.sin((Math.PI * rgb) / maxRgb));
}
export function install(name, ...args) {
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
export function installSpread(name, ...args) {
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
export const NONE = install("NONE", -1);
export const BLACK = install("black", 0x000);
export const WHITE = install("white", 0xfff);
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
