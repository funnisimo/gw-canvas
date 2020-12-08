
import { options } from './config';



type ColorData = number[];
export type ColorBase = string|number|Color|ColorData;


function toColorInt(r=0, g=0, b=0, base256=false) {
  if (base256) {
      r = Math.max(0, Math.min(255, Math.round(r * 2.550001)));
      g = Math.max(0, Math.min(255, Math.round(g * 2.550001)));
      b = Math.max(0, Math.min(255, Math.round(b * 2.550001)));
      return (r << 16) + (g << 8) + b;
  }
  r = Math.max(0, Math.min(15, Math.round(r / 100 * 15)));
  g = Math.max(0, Math.min(15, Math.round(g / 100 * 15)));
  b = Math.max(0, Math.min(15, Math.round(b / 100 * 15)));
  return (r << 8) + (g << 4) + b;
}



export class Color extends Int16Array {

    static fromArray(vals:ColorData, base256=false) {
      while(vals.length < 3) vals.push(0);
      if (base256) {
        for(let i = 0; i < 7; ++i) {
          vals[i] = Math.round((vals[i] || 0) * 100 / 255);
        }
      }
      return new this(...vals);
    }

    static fromCss(css:string) {
        if (!css.startsWith('#')) {
          throw new Error('Color CSS strings must be of form "#abc" or "#abcdef" - received: [' + css + ']');
        }
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
        for(let i = 0; i < c.length; ++i) {
          c[i] = 0;
        }
        if (val < 0) {
          c._r = -1;
        }
        else if (base256 || (val > 0xFFF)) {
          c._r = Math.round(((val & 0xFF0000) >> 16) * 100 / 255);
          c._g = Math.round(((val & 0xFF00) >> 8) * 100 / 255);
          c._b = Math.round((val & 0xFF) * 100 / 255);
        }
        else {
          c._r = Math.round(((val & 0xF00) >> 8) * 100 / 15);
          c._g = Math.round(((val & 0xF0) >> 4) * 100 / 15);
          c._b = Math.round((val & 0xF) * 100 / 15);
        }
        return c;
    }

    static make(arg:ColorBase, base256=false): Color {
      if ((arg === undefined) || (arg === null)) return new this(-1);
      if (arg instanceof Color) {
        return arg.clone();
      }
      if (typeof arg === 'string') {
        const l = options.colorLookup(arg);
        if (l) return l.clone();
        return this.fromCss(arg);
      }
      else if (Array.isArray(arg)) {
        return this.fromArray(arg, base256);
      }
      else if (typeof arg === 'number') {
        if (arg < 0) return new this(-1);
        return this.fromNumber(arg, base256);
      }
      throw new Error('Failed to make color - unknown argument: ' + JSON.stringify(arg));
    }
    
    static from(): Color;
    static from(rgb: number, base256?:boolean): Color;
    static from(color: ColorBase): Color;
    static from(arrayLike: ArrayLike<number>): Color;
    static from(...args: any[]): Color {
      const arg = args[0];
      if (arg instanceof Color) return arg;
      if (arg < 0) return new this(-1);
      if (typeof arg === 'string') {
        const l = options.colorLookup(arg);
        if (l) return l;
      }
      return this.make(arg, args[1]);
    }

    constructor(r=-1,g=0,b=0,rand=0,redRand=0,greenRand=0,blueRand=0) {
      super(7);
      this.set([r, g, b, rand, redRand, greenRand, blueRand]);
    }

    get r() { return Math.round(this[0] * 2.550001); }
    private get _r() { return this[0]; }
    private set _r(v:number) { this[0] = v; }
    
    get g() { return Math.round(this[1] * 2.550001); }
    private get _g() { return this[1]; }
    private set _g(v:number) { this[1] = v; }

    get b() { return Math.round(this[2] * 2.550001); }
    private get _b() { return this[2]; }
    private set _b(v:number) { this[2] = v; }
    
    private get _rand() { return this[3]; }
    private get _redRand() { return this[4]; }
    private get _greenRand() { return this[5]; }
    private get _blueRand() { return this[6]; }

    // luminosity (0-100)
    get l() { 
      return Math.round(0.5 * (Math.min(this._r, this._g, this._b) + Math.max(this._r, this._g, this._b)));
    }
    // saturation (0-100)
    get s() {
      if (this.l >= 100) return 0;
      return Math.round((Math.max(this._r, this._g, this._b) - Math.min(this._r, this._g, this._b)) * (100 - Math.abs(this.l * 2 - 100)) / 100);
    }
    // hue (0-360)
    get h() {
      let H = 0;
      let R = this.r;
      let G = this.g;
      let B = this.b;
           if (R >= G && G >= B)  { H = 60 * ((G-B)/(R-B)); }
      else if (G >  R && R >= B)  { H = 60 * (2 - (R-B)/(G-B)); }
      else if (G >= B && B  > R)  { H = 60 * (2 + (B-R)/(G-R)); }
      else if (B >  G && G  > R)  { H = 60 * (4 - (G-R)/(B-R)); }
      else if (B >  R && R >= G)  { H = 60 * (4 + (R-G)/(B-G)); }
      else                        { H = 60 * (6 - (B-G)/(R-G)); }
      return Math.round(H);
    }

    isNull() { return this._r < 0; }

    equals(other:ColorBase) {
      if (typeof other === 'string') {
        return (other.length > 4) ? (this.toString(true) == other) : (this.toString() == other);
      }
      else if (typeof other === 'number') {
        return (this.toInt() == other) || (this.toInt(true) == other);
      }
      const O = Color.from(other);
      if (this.isNull()) return O.isNull();
      return this.every( (v:number,i:number) => {
        return v == (O[i] || 0);
      } );
    }

    copy(other:ColorBase) {
      if (Array.isArray(other)) {
        this.set(other);
      }
      else {
        const O = Color.from(other);
        this.set(O);
      }
      return this;
    }

    protected _changed() {
      return this;
    }

    clone() {
        // @ts-ignore
        const other = new this.constructor();
        other.copy(this);
        return other;
    }

    assign(_r=-1,_g=0,_b=0,_rand=0,_redRand=0,_greenRand=0,_blueRand=0) {
      for(let i = 0; i < this.length; ++i) {
        this[i] = (arguments[i] || 0);
      }
      return this;
    }
    
    assignRGB(_r=-1,_g=0,_b=0,_rand=0,_redRand=0,_greenRand=0,_blueRand=0) {
      for(let i = 0; i < this.length; ++i) {
        this[i] = Math.round((arguments[i] || 0) / 2.55);
      }
      return this;
    }

    nullify() {
      this[0] = -1;
      return this;
    }
    
    blackOut() {
      for(let i = 0; i < this.length; ++i) {
        this[i] = 0;
      }
      return this;
    }

    toInt(base256=false) {
      if (this.isNull()) return -1;
      return toColorInt(this._r, this._g, this._b, base256);
    }

    clamp() {
      if (this.isNull()) return this;
      
      this._r = Math.min(100, Math.max(0, this._r));
      this._g = Math.min(100, Math.max(0, this._g));
      this._b = Math.min(100, Math.max(0, this._b));
      return this._changed();
    }

    mix(other:ColorBase, percent:number) {
      const O = Color.from(other);
      if (O.isNull()) return this;
      if (this.isNull()) {
        this.blackOut();
      }
      percent = Math.min(100, Math.max(0, percent));
      const keepPct = 100 - percent;
      for(let i = 0; i < this.length; ++i) {
        this[i] = Math.round(((this[i] * keepPct) + (O[i]*percent)) / 100);
      }
      return this._changed();
    }

    // Only adjusts r,g,b
    lighten(percent:number) {
      if (this.isNull()) return this;
      
      percent = Math.min(100, Math.max(0, percent));
      if (percent <= 0) return;
      
      const keepPct = 100 - percent;
      for(let i = 0; i < 3; ++i) {
        this[i] = Math.round(((this[i] * keepPct) + (100*percent)) / 100);
      }
      return this._changed();
    }

    // Only adjusts r,g,b
    darken(percent:number) {
      if (this.isNull()) return this;

      percent = Math.min(100, Math.max(0, percent));
      if (percent <= 0) return;

      const keepPct = 100 - percent;
      for(let i = 0; i < 3; ++i) {
        this[i] = Math.round(((this[i] * keepPct) + (0*percent)) / 100);
      }
      return this._changed();
    }

    bake() {
      if (this.isNull()) return this;

      const d = this;
      if (d[3] + d[4] + d[5] + d[6]) {
        const rand      = this._rand ? Math.floor(options.random() * this._rand) : 0;
        const redRand   = this._redRand ? Math.floor(options.random() * this._redRand) : 0;
        const greenRand = this._greenRand ? Math.floor(options.random() * this._greenRand) : 0;
        const blueRand  = this._blueRand ? Math.floor(options.random() * this._blueRand) : 0;
        this._r += (rand + redRand);
        this._g += (rand + greenRand);
        this._b += (rand + blueRand);
        for(let i = 3; i < this.length; ++i) {
          this[i] = 0;
        }
        return this._changed();
      }
      return this;
    }

    // Adds a color to this one
    add(other:ColorBase, percent:number=100) {
      const O = Color.from(other);
      if (O.isNull()) return this;
      if (this.isNull()) {
        this.blackOut();
      }

      for(let i = 0; i < this.length; ++i) {
        this[i] += Math.round(O[i] * percent / 100);
      }
      return this._changed();
    } 

    scale(percent:number) {
      if (this.isNull() || percent == 100) return this;
      
      percent = Math.max(0, percent);
      for(let i = 0; i < this.length; ++i) {
        this[i] = Math.round(this[i] * percent / 100);
      }
      return this._changed();
    }

    multiply(other:ColorData|Color) {
      if (this.isNull()) return this;
      let data = other as Int16Array;
      if (!Array.isArray(other)) {
        if (other.isNull()) return this;
        data = other;
      }
      
      const len = Math.max(3, Math.min(this.length, data.length));
      for(let i = 0; i < len; ++i) {
        this[i] = Math.round(this[i] * (data[i] || 0) / 100);
      }
      return this._changed();
    }
    
    // scales rgb down to a max of 100
    normalize() {
      if (this.isNull()) return this;
      const max = Math.max(this._r, this._g, this._b);
      if (max <= 100) return this;
      this._r = Math.round(100 * this._r/max);
      this._g = Math.round(100 * this._g/max);
      this._b = Math.round(100 * this._b/max);
      return this._changed();
    }

    css(base256=false) {
      const d = this;
      let v = 0;
      if (d[3] + d[4] + d[5] + d[6]) {
        const rand      = this._rand ? Math.floor(options.random() * this._rand) : 0;
        const redRand   = this._redRand ? Math.floor(options.random() * this._redRand) : 0;
        const greenRand = this._greenRand ? Math.floor(options.random() * this._greenRand) : 0;
        const blueRand  = this._blueRand ? Math.floor(options.random() * this._blueRand) : 0;
        
        const red = (this._r + rand + redRand);
        const green = (this._g + rand + greenRand);
        const blue = (this._b + rand + blueRand);
        v = toColorInt(red, green, blue, base256);
      }
      else {
        v = this.toInt(base256);
      }
      return '#' + v.toString(16).padStart(base256 ? 6 : 3, '0');
    }

    toString(base256=false) {
      if (this.isNull()) return 'null color';
      return '#' + this.toInt(base256).toString(16).padStart(base256 ? 6 : 3, '0');
    }
    
    // adjusts the luminosity of 2 colors to ensure there is enough separation between them
    static separate(a:Color, b:Color) {
      if (a.isNull() || b.isNull()) return;
      
      const A = a.clone().clamp();
      const B = b.clone().clamp();

      // console.log('separate');
      // console.log('- a=%s, h=%d, s=%d, l=%d', A.toString(), A.h, A.s, A.l);
      // console.log('- b=%s, h=%d, s=%d, l=%d', B.toString(), B.h, B.s, B.l);

      let hDiff = Math.abs(A.h - B.h);
      if (hDiff > 180) { hDiff = 360 - hDiff; }
      if (hDiff > 45) return; // colors are far enough apart in hue to be distinct

      const dist = 40;
      if (Math.abs(A.l - B.l) >= dist) return;
      
      // Get them sorted by saturation ( we will darken the more saturated color and lighten the other)
      const [lo, hi] = [A, B].sort( (a, b) => a.s - b.s );

      // console.log('- lo=%s, hi=%s', lo.toString(), hi.toString());

      while( (hi.l - lo.l) < dist) {
        hi.mix(WHITE, 5);
        lo.mix(BLACK, 5);
      }

      a.copy(A);
      b.copy(B);
      // console.log('=>', a.toString(), b.toString());
    }
    
}

const BLACK = new Color(0,0,0);
const WHITE = new Color(100,100,100);

