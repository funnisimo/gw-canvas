
import { options } from './config';


type ColorData = number[];
export type ColorRoots = Color|ColorData|string|number;


export class Color {
    private _data: number[];

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

    static make(arg:ColorRoots, base256=false) {
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
    
    static from(arg:ColorRoots, base256=false) {
      if (arg instanceof this) return arg;
      return this.make(arg, base256);
    }

    constructor(r=-1,g=0,b=0,rand=0,redRand=0,greenRand=0,blueRand=0) {
      this._data = [r,g,b,rand,redRand,greenRand,blueRand];
    }

    private get _r() { return this._data[0]; }
    private set _r(v:number) { this._data[0] = v; }
    
    private get _g() { return this._data[1]; }
    private set _g(v:number) { this._data[1] = v; }

    private get _b() { return this._data[2]; }
    private set _b(v:number) { this._data[2] = v; }
    
    private get _rand() { return this._data[3]; }
    private get _redRand() { return this._data[4]; }
    private get _greenRand() { return this._data[5]; }
    private get _blueRand() { return this._data[6]; }

    isNull() { return this._r < 0; }

    equals(other:ColorRoots) {
      if (typeof other === 'string' || typeof other === 'number') {
        other = Color.from(other);
      } 
      if (other instanceof Color) {
          other = other._data;
      }
      const data = other as ColorData;
      return this._data.every( (v:number,i:number) => {
        return v == (data[i] || 0);
      } );
    }

    copy(other:ColorRoots) {
      if (typeof other === 'string' || typeof other === 'number') {
        other = Color.from(other);
      } 
      if (other instanceof Color) {
          other = other._data;
      }
      return this.set(...other);
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

    nullify() {
      return this.set(-1,0,0);
    }
    
    blackOut() {
      return this.set(0,0,0);
    }

    toInt(base256=false) {
      if (this.isNull()) return -1;
      if (base256) {
          const r = Math.round(this._r / 100 * 255) & 0xFF;
          const g = Math.round(this._g / 100 * 255) & 0xFF;
          const b = Math.round(this._b / 100 * 255) & 0xFF;
          return (r << 16) + (g << 8) + b;
      }
      const r = Math.round(this._r / 100 * 15) & 0xF;
      const g = Math.round(this._g / 100 * 15) & 0xF;
      const b = Math.round(this._b / 100 * 15) & 0xF;
      return (r << 8) + (g << 4) + b;
    }

    fromInt(val:number, base256=false) {
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = 0;
      }
      if (base256) {
          this._r = Math.round((val >> 16) * 100 / 255);
          this._g = Math.round(((val & 0xFF00) >> 8) * 100 / 255);
          this._b = Math.round((val & 0xFF) * 100 / 255);
          return this;
      }
      this._r = Math.round((val >> 8) * 100 / 15);
      this._g = Math.round(((val & 0xF0) >> 4) * 100 / 15);
      this._b = Math.round((val & 0xF) * 100 / 15);
      return this;
    }

    clamp() {
      if (this.isNull()) return;
      
      this._r = Math.min(100, Math.max(0, this._r));
      this._g = Math.min(100, Math.max(0, this._g));
      this._b = Math.min(100, Math.max(0, this._b));
      return this;
    }

    mix(other:ColorRoots, percent:number) {
      if (this.isNull()) {
        this.blackOut();
      }
      if (typeof other === 'string' || typeof other === 'number') {
        other = Color.from(other);
      } 
      if (other instanceof Color) {
          other = other._data;
      }
      percent = Math.min(100, Math.max(0, percent));
      const keepPct = 100 - percent;
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = Math.round(((this._data[i] * keepPct) + (other[i]*percent)) / 100);
      }
      return this;
    }

    // Only adjusts r,g,b
    lighten(percent:number) {
      if (this.isNull()) return this;
      
      percent = Math.min(100, Math.max(0, percent));
      if (percent == 0) return;
      
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
      if (percent == 0) return;

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
    add(other:ColorRoots, percent:number=100) {
      if (this.isNull()) {
        this.blackOut();
      }

      if (typeof other === 'string' || typeof other === 'number') {
        other = Color.from(other);
      } 
      if (other instanceof Color) {
        other = other._data;
      }
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] += Math.round(other[i] * percent / 100);
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

    multiply(other:ColorRoots) {
      if (this.isNull()) return this;
      
      if (typeof other === 'string' || typeof other === 'number') {
        other = Color.from(other);
      } 
      if (other instanceof Color) {
          other = other._data;
      }
      for(let i = 0; i < this._data.length; ++i) {
        this._data[i] = Math.round(this._data[i] * other[i] / 100);
      }
      return this;
    }

    toString(base256=false) {
      if (this.isNull()) return 'null color';
      return '#' + this.toInt(base256).toString(16).padStart(base256 ? 6 : 3, '0');
    }
}


