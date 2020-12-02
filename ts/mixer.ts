
import { Color } from './color';
import { DrawInfo } from './buffer';


export class Mixer {
  public ch:string|number;
  public fg:Color;
  public bg:Color;

  constructor() {
    this.ch = 0;
    this.fg = new Color();
    this.bg = new Color();
  }

  copy(other:Mixer) {
    this.ch = other.ch;
    this.fg.copy(other.fg);
    this.bg.copy(other.bg);
    return this;
  }
  
  clone() {
    const other = new Mixer();
    other.copy(this);
    return other;
  }

  nullify() {
    this.ch = 0;
    this.fg.nullify();
    this.bg.nullify();
    return this;
  }
  
  blackOut() {
    this.ch = 0;
    this.fg.blackOut();
    this.bg.blackOut();
    return this;
  }

  draw(info:DrawInfo, opacity=100) {
    if (opacity <= 0) return;
    if (info.ch) this.ch = info.ch;
    if (info.fg) this.fg.mix(info.fg, opacity);
    if (info.bg) this.bg.mix(info.bg, opacity);
    return this;
  }
  
  swapColors() {
    [this.bg, this.fg] = [this.fg, this.bg];
    return this;
  }

}


