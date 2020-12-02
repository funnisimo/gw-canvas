

type ColorData = [number, number, number];


export class Color {
    public r:number=0;
    public g:number=0;
    public b:number=0;

    static fromArray(vals:ColorData, base256=false) {
        if (vals.length < 3) throw new Error('Colors must have 3 values.');
        if (base256) {
            vals = vals.map( (v) => Math.round(v * 100 / 255) ) as ColorData;
        }
        return new this(vals[0], vals[1], vals[2]);
    }

    static fromString(css:string) {
        if (!css.startsWith('#')) throw new Error('Color strings must be of form "#abc" or "#abcdef"');
        const c = Number.parseInt(css.substring(1),16);
        let r, g, b;
        if (css.length == 4) {
            r = Math.round((c >> 8) / 15 * 100);
            g = Math.round(((c & 0xF0) >> 4) / 15 * 100);
            b = Math.round((c & 0xF) / 15 * 100);
        }
        else {
            r = Math.round((c >> 16) / 255 * 100);
            g = Math.round(((c & 0xFF00) >> 8) / 255 * 100);
            b = Math.round((c & 0xFF) / 255 * 100);
        }
        return new this(r, g, b);
    }

    static fromNumber(val:number, base256=false) {
        const c = new this();
        c.fromInt(val, base256);
        return c;
    }

    constructor(r:number=0,g:number=0,b:number=0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    equals(other:Color|ColorData) {
        if (Array.isArray(other)) {
            other = TEMP_COLOR.set(other[0], other[1], other[2]);
        }
        return (this.r == other.r) && (this.g == other.g) && (this.b == other.b);
    }

    copy(other:Color|ColorData) {
        if (Array.isArray(other)) {
            other = TEMP_COLOR.set(other[0], other[1], other[2]);
        }
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
        return this;
    }

    clone() {
        const other = new Color(); // Object.create(this.__proto__);
        other.copy(this);
        return other;
    }

    set(r:number=0, g:number=0, b:number=0) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this;
    }

    clear() {
        return this.set(0,0,0);
    }

    toInt(base256=false) {
        if (base256) {
            const r = Math.round(this.r / 100 * 255) & 0xFF;
            const g = Math.round(this.g / 100 * 255) & 0xFF;
            const b = Math.round(this.b / 100 * 255) & 0xFF;
            return (r << 16) + (g << 8) + b;
        }
        const r = Math.round(this.r / 100 * 15) & 0xF;
        const g = Math.round(this.g / 100 * 15) & 0xF;
        const b = Math.round(this.b / 100 * 15) & 0xF;
        return (r << 8) + (g << 4) + b;
    }

    fromInt(val:number, base256=false) {
        if (base256) {
            this.r = Math.round((val >> 16) * 100 / 255);
            this.g = Math.round(((val & 0xFF00) >> 8) * 100 / 255);
            this.b = Math.round((val & 0xFF) * 100 / 255);
            return this;
        }
        this.r = Math.round((val >> 8) * 100 / 15);
        this.g = Math.round(((val & 0xF0) >> 4) * 100 / 15);
        this.b = Math.round((val & 0xF) * 100 / 15);
        return this;
    }

    clamp() {
        this.r = Math.min(100, Math.max(0, this.r));
        this.g = Math.min(100, Math.max(0, this.g));
        this.b = Math.min(100, Math.max(0, this.b));
        return this;
    }

    mix(other:Color|ColorData, percent:number) {
        if (Array.isArray(other)) {
            other = TEMP_COLOR.set(other[0], other[1], other[2]);
        }
        this._mix(other.r, other.g, other.b, percent);
        return this;
    }

    lighten(percent:number) {
        this._mix(100,100,100,percent);
        return this;
    }

    darken(percent:number) {
        this._mix(0,0,0,percent);
        return this;
    }

    private _mix(r:number,g:number,b:number,percent:number) {
        percent = Math.min(100, Math.max(0, percent));
        const keepPct = 100 - percent;
        this.r = Math.round(((this.r * keepPct) + (r*percent)) / 100);
        this.g = Math.round(((this.g * keepPct) + (g*percent)) / 100);
        this.b = Math.round(((this.b * keepPct) + (b*percent)) / 100);
    }

    // Adds a color to this one
    add(other:Color|ColorData, percent:number=100) {
        if (Array.isArray(other)) {
            other = TEMP_COLOR.set(other[0], other[1], other[2]);
        }
        this.r += Math.round(other.r * percent / 100);
        this.g += Math.round(other.g * percent / 100);
        this.b += Math.round(other.b * percent / 100);
        return this;
    } 

    scale(percent:number) {
        percent = Math.max(0, percent);
        this.r = Math.round(this.r * percent / 100);
        this.g = Math.round(this.g * percent / 100);
        this.b = Math.round(this.b * percent / 100);
        return this;
    }

    multiply(other:Color|ColorData) {
        if (Array.isArray(other)) {
            other = TEMP_COLOR.set(other[0], other[1], other[2]);
        }
        this.r = Math.round(this.r * other.r / 100);
        this.g = Math.round(this.g * other.g / 100);
        this.b = Math.round(this.b * other.b / 100);
        return this;
    }

    toString(base256=false) {
      return '#' + this.toInt(base256).toString(16);
    }
}

const TEMP_COLOR = new Color();

export function make(arg:ColorData|string|number, base256=false) {
    if (typeof arg === 'string') {
        return Color.fromString(arg);
    }
    else if (Array.isArray(arg)) {
        return Color.fromArray(arg, base256);
    }
    else if (typeof arg === 'number') {
        return Color.fromNumber(arg, base256);
    }
    throw new Error('Failed to make color - unknown argument: ' + JSON.stringify(arg));
}
