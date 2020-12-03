
import { options } from './config';


type ColorData = number[];
export type ColorBase = Color|ColorData|string|number;


export class Color {
    private _data: number[];

    static fromArray(vals:ColorData, base256=false) {
        if (vals.length < 3) throw new Error('Colors must have 3 values.');
        if (base256) {
            vals = vals.map( (v) => Math.round(v * 100 / 255) ) as ColorData;
        }
        return new this(...vals);
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

    static make(arg:ColorBase, base256=false) {
        if (arg instanceof this) {
          return arg.clone();
        }
        if (typeof arg === 'string') {
            return this.fromString(arg);
        }
        else if (Array.isArray(arg)) {
            return this.fromArray(arg, base256);
        }
        else if (typeof arg === 'number') {
            return this.fromNumber(arg, base256);
        }
        throw new Error('Failed to make color - unknown argument: ' + JSON.stringify(arg));
    }
    
    static from(arg:ColorBase, base256=false) {
      if (arg instanceof this) return arg;
      if (arg < 0) return new this();
      return this.make(arg, base256);
    }

    constructor(r=-1,g=0,b=0,rand=0,redRand=0,greenRand=0,blueRand=0) {
      this._data = [r,g,b,rand,redRand,greenRand,blueRand];
    }

    get r() { return Math.round(this._data[0] * 2.550001); }
    private get _r() { return this._data[0]; }
    private set _r(v:number) { this._data[0] = v; }
    
    get g() { return Math.round(this._data[1] * 2.550001); }
    private get _g() { return this._data[1]; }
    private set _g(v:number) { this._data[1] = v; }

    get b() { return Math.round(this._data[2] * 2.550001); }
    private get _b() { return this._data[2]; }
    private set _b(v:number) { this._data[2] = v; }
    
    private get _rand() { return this._data[3]; }
    private get _redRand() { return this._data[4]; }
    private get _greenRand() { return this._data[5]; }
    private get _blueRand() { return this._data[6]; }

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
      other = Color.from(other);
      const data = other._data;
      return this._data.every( (v:number,i:number) => {
        return v == (data[i] || 0);
      } );
    }

    copy(other:ColorBase) {
      other = Color.from(other);
      return this.set(...other._data);
    }

    clone() {
        const other = new Color(); // Object.create(this.__proto__);
        other.copy(this);
        return other;
    }

    set(_r=0,_g=0,_b=0,_rand=0,_redRand=0,_greenRand=0,_blueRand=0) {
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = arguments[i] || 0;
      }
      return this;
    }
    
    setRGB(_r=0,_g=0,_b=0,_rand=0,_redRand=0,_greenRand=0,_blueRand=0) {
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = Math.round((arguments[i] || 0) / 2.55);
      }
      return this;
    }

    nullify() {
      return this.set(-1,0,0);
    }
    
    blackOut() {
      return this.set(0,0,0);
    }

    toInt(base256=false) {
      if (this.isNull()) return -1;
      if (base256) {
          const r = Math.max(0, Math.min(255, this.r));
          const g = Math.max(0, Math.min(255, this.g));
          const b = Math.max(0, Math.min(255, this.b));
          return (r << 16) + (g << 8) + b;
      }
      const r = Math.max(0, Math.min(15, Math.round(this._r / 100 * 15)));
      const g = Math.max(0, Math.min(15, Math.round(this._g / 100 * 15)));
      const b = Math.max(0, Math.min(15, Math.round(this._b / 100 * 15)));
      return (r << 8) + (g << 4) + b;
    }

    fromInt(val:number, base256=false) {
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = 0;
      }
      if (val < 0) {
        this._r = -1;
      }
      else if (base256) {
          this._r = Math.round((val >> 16) * 100 / 255);
          this._g = Math.round(((val & 0xFF00) >> 8) * 100 / 255);
          this._b = Math.round((val & 0xFF) * 100 / 255);
          return this;
      }
      else {
        this._r = Math.round((val >> 8) * 100 / 15);
        this._g = Math.round(((val & 0xF0) >> 4) * 100 / 15);
        this._b = Math.round((val & 0xF) * 100 / 15);
      }
      return this;
    }

    clamp() {
      if (this.isNull()) return this;
      
      this._r = Math.min(100, Math.max(0, this._r));
      this._g = Math.min(100, Math.max(0, this._g));
      this._b = Math.min(100, Math.max(0, this._b));
      return this;
    }

    mix(other:ColorBase, percent:number) {
      other = Color.from(other);
      if (other.isNull()) return this;
      if (this.isNull()) {
        this.blackOut();
      }
      const data = other._data;
      percent = Math.min(100, Math.max(0, percent));
      const keepPct = 100 - percent;
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = Math.round(((this._data[i] * keepPct) + (data[i]*percent)) / 100);
      }
      return this;
    }

    // Only adjusts r,g,b
    lighten(percent:number) {
      if (this.isNull()) return this;
      
      percent = Math.min(100, Math.max(0, percent));
      if (percent <= 0) return;
      
      const keepPct = 100 - percent;
      for(let i = 0; i < 3; ++i) {
        this._data[i] = Math.round(((this._data[i] * keepPct) + (100*percent)) / 100);
      }
      return this;
    }

    // Only adjusts r,g,b
    darken(percent:number) {
      if (this.isNull()) return this;

      percent = Math.min(100, Math.max(0, percent));
      if (percent <= 0) return;

      const keepPct = 100 - percent;
      for(let i = 0; i < 3; ++i) {
        this._data[i] = Math.round(((this._data[i] * keepPct) + (0*percent)) / 100);
      }
      return this;
    }

    bake() {
      if (this.isNull()) return this;

      const rand      = this._rand ? Math.floor(options.random() * this._rand) : 0;
      const redRand   = this._redRand ? Math.floor(options.random() * this._redRand) : 0;
      const greenRand = this._greenRand ? Math.floor(options.random() * this._greenRand) : 0;
      const blueRand  = this._blueRand ? Math.floor(options.random() * this._blueRand) : 0;
      this._r += (rand + redRand);
      this._g += (rand + greenRand);
      this._b += (rand + blueRand);
      for(let i = 3; i < this._data.length; ++i) {
        this._data[i] = 0;
      }
      return this;
    }

    // Adds a color to this one
    add(other:ColorBase, percent:number=100) {
      other = Color.from(other);
      if (other.isNull()) return this;
      if (this.isNull()) {
        this.blackOut();
      }

      const data = other._data;
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] += Math.round(data[i] * percent / 100);
      }
      return this;
    } 

    scale(percent:number) {
      if (this.isNull()) return this;
      
      percent = Math.max(0, percent);
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = Math.round(this._data[i] * percent / 100);
      }
      return this;
    }

    multiply(other:ColorBase) {
      other = Color.from(other);
      if (other.isNull()) return this;
      if (this.isNull()) return this;
      
      const data = other._data;
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = Math.round(this._data[i] * data[i] / 100);
      }
      return this;
    }
    
    // scales rgb down to a max of 100
    normalize() {
      if (this.isNull()) return this;
      const max = Math.max(this._r, this._g, this._b);
      if (max <= 100) return this;
      this._r = Math.round(100 * this._r/max);
      this._g = Math.round(100 * this._g/max);
      this._b = Math.round(100 * this._b/max);
      return this;
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

