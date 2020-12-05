
import { Color } from './color';
import { options } from './config';


describe('Color', () => {

  let random: () => number;
  
  beforeAll(() => {
    random = options.random;
    options.random = jest.fn().mockReturnValue(0.5);
  });
  
  afterAll(() => {
    options.random = random;
  });


    test('make - color', () => {
      const c = new Color(100,50,0);
      const d = Color.make(c);
      expect(c).not.toBe(d);
      expect(c.equals(d)).toBeTruthy();

      // @ts-ignore
      expect( () => Color.make({})).toThrow();
      
      // @ts-ignore
      const e = Color.make();
      expect(e.isNull()).toBeTruthy();

      // @ts-ignore
      const f = Color.make(null);
      expect(f.isNull()).toBeTruthy();

      // @ts-ignore
      const g = Color.make(undefined);
      expect(g.isNull()).toBeTruthy();

    });

    test('fromArray', () => {
        const c = Color.fromArray([0,50, 100]);
        expect(c.toString()).toEqual('#08f');

        const d = Color.fromArray([0, 128, 255], true);
        expect(d.toString()).toEqual('#08f');

        const e = Color.fromArray([-10, 200, 50]);
        expect(e.equals([-10,200,50])).toBeTruthy();

        const f = Color.fromArray([-50, 510, 255], true);
        expect(f.equals([-20,200,100])).toBeTruthy();

        expect(Color.fromArray([]).toString()).toEqual('#000');
    });

    test('make - array', () => {
        const c = Color.make([0,50,100]);
        expect(c.toString()).toEqual('#08f');

        const d = Color.make([0,128,255], true);
        expect(d.toString()).toEqual('#08f');
    });

    test('fromString', () => {
        const c = Color.fromString('#07F');
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = Color.fromString('#0080FF');
        expect(d.equals([0,50,100])).toBeTruthy();
        
        expect(() => Color.fromString('black')).toThrow();
    });

    test('make - string', () => {
        const c = Color.make('#07F');
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = Color.make('#0080FF');
        expect(d.equals([0,50,100])).toBeTruthy();
    });

    test('fromNumber', () => {
        const c = Color.fromNumber(0x07F);
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = Color.fromNumber(0x0080FF, true);
        expect(d.equals([0,50,100])).toBeTruthy();
    });

    test('make - number', () => {
        const c = Color.make(0x07F);
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = Color.make(0x0080FF, true);
        expect(d.equals([0,50,100])).toBeTruthy();
        
        const e = Color.make(0x202020); // automatic base256 detect (> 0xFFF)
        expect(e.toString()).toEqual('#222');
    });
    
    test('from', () => {
      const c = Color.from(-1);
      expect(c.isNull()).toBeTruthy();
    });

    test('equals', () => {
        const a = new Color(100, 50, 0);
        const b = new Color(100, 50, 0);
        const c = new Color(50, 50, 50);
        const d = new Color();

        expect(a.equals(b)).toBeTruthy();
        expect(a.equals(c)).toBeFalsy();
        expect(a.equals([100,50,0])).toBeTruthy();
        expect(a.equals([50,50,50])).toBeFalsy();
        
        // @ts-ignore
        expect(a.equals(null)).toBeFalsy();
        // @ts-ignore
        expect(a.equals()).toBeFalsy();
        expect(a.equals(d)).toBeFalsy();
        expect(d.equals(a)).toBeFalsy();
    });

    test('copy', () => {
      const a = new Color();
      const b = new Color(100, 50, 0);
      expect(a.equals(b)).toBeFalsy();
      a.copy(b);
      expect(a.equals(b)).toBeTruthy();
    });
    
    test('clone', () => {
      const a = new Color(100, 50, 0);
      const b = a.clone();
      expect(a.equals(b)).toBeTruthy();
    });

    test('set', () => {
      const a = new Color();
      a.set(100, 50, 0);
      expect(a.equals([100, 50, 0])).toBeTruthy();
      
      a.set(1,2,3,4,5,6,7);
      expect(a.equals([1,2,3,4,5,6,7])).toBeTruthy();
      
      a.set();
      expect(a.toString()).toEqual('#000');
    });
    
    test('setRGB', () => {
      const a = new Color();
      a.setRGB(255, 128, 0);
      expect(a.equals([100, 50, 0])).toBeTruthy();
      
      a.setRGB(255,255,255,255,255,255,255);
      expect(a.equals([100,100,100,100,100,100,100])).toBeTruthy();
      
      a.setRGB();
      expect(a.toString()).toEqual('#000');
    });

    test('nullify', () => {
      const c = Color.fromNumber(0xFF0);
      expect(c.isNull()).toBeFalsy();
      c.nullify();
      expect(c.isNull()).toBeTruthy();
    });

    test('blackOut', () => {
      const a = new Color(100, 50, 0);
      expect(a.toInt()).toEqual(0xF80);
      a.blackOut();
      expect(a.toInt()).toEqual(0x000);
    });

    test('toInt', () => {
        const c = new Color(100, 47, 0);
        expect(c.toInt()).toEqual(0xF70);
        expect(c.toInt(true)).toEqual(0xFF7800);

        const d = new Color(100, 50, 0);
        expect(d.toInt()).toEqual(0xF80);
        expect(d.toInt(true)).toEqual(0xFF8000);
        
        const e = new Color();
        expect(e.isNull()).toBeTruthy();
        expect(e.toInt()).toEqual(-1);
    });

    test('fromInt', () => {
        const c = new Color().fromInt(0xF70);
        expect(c.toString()).toEqual('#f70')

        const d = new Color().fromInt(0xFF8000, true);
        expect(d.toString()).toEqual('#f80');
        
        const e = new Color(100,100,100).fromInt(-1);
        expect(e.isNull()).toBeTruthy();
    });

    test('clamp', () => {
      const c = new Color();
      expect(c.isNull()).toBeTruthy();
      c.clamp();
      expect(c.isNull()).toBeTruthy();
      
      c.set(200, -100, 50);
      c.clamp();
      expect(c.equals([100,0,50])).toBeTruthy();
      
    });
    
    test('mix', () => {
      const c = new Color();
      const white = new Color(100,100,100);
      const black = new Color(0,0,0);
      const red = new Color(100,0,0);
      const blue = new Color(0,0,100);
      const nullColor = new Color();

      expect(c.isNull()).toBeTruthy();
      c.mix(nullColor, 50);
      expect(c.isNull()).toBeTruthy();
        
      c.mix(white, 50);
      expect(c.equals([50,50,50])).toBeTruthy();
      expect(c.isNull()).toBeFalsy();
      
      c.mix(red, 50);
      expect(c.toString()).toEqual('#b44');
      expect(c.toString(true)).toEqual('#bf4040');
      c.mix(black, 50);
      expect(c.toString()).toEqual('#622');
      c.mix(blue, 50);
      expect(c.toString()).toEqual('#319');
    });

    test('lighten', () => {
      const c = Color.fromNumber(0x840)
      c.lighten(0);
      expect(c.toString()).toEqual('#840')
      c.lighten(50);
      expect(c.toString()).toEqual('#ca8');
      
      const d = new Color();
      expect(d.isNull()).toBeTruthy();
      d.lighten(50);
      expect(d.isNull()).toBeTruthy();
    });
    
    test('darken', () => {
      const c = Color.fromNumber(0x8BF);
      c.darken(0);
      expect(c.toString()).toEqual('#8bf')
      c.darken(50);
      expect(c.toString()).toEqual('#468');

      const d = new Color();
      expect(d.isNull()).toBeTruthy();
      d.darken(50);
      expect(d.isNull()).toBeTruthy();
    });

    test('bake', () => {
      const c = new Color(0,0,0,20,10,10,10);
      expect(c.toString()).toEqual('#000');
      c.bake();
      expect(c.toString()).not.toEqual('#000');
      expect(c.r).toBeGreaterThan(0);
      expect(c.g).toBeGreaterThan(0);
      expect(c.b).toBeGreaterThan(0);
      
      const d = new Color();
      expect(d.isNull()).toBeTruthy();
      d.bake();
      expect(d.isNull()).toBeTruthy();
      
      const e = Color.fromArray([50, 50, 50]);
      e.bake();
      expect(e.toString()).toEqual('#888');
    });
    
    test('add', () => {
      const c = Color.fromNumber(0x444);
      const nullColor = new Color();
      c.add(nullColor);
      expect(c.toString()).toEqual('#444');

      const d = Color.fromNumber(0x222);
      c.add(d);
      expect(c.toString()).toEqual('#666');
      
      c.add([47,47,47]);
      expect(c.toString()).toEqual('#ddd');
      
      const e = new Color();
      expect(e.isNull()).toBeTruthy();
      e.add(d, 50);
      expect(e.toString()).toEqual('#111');
      expect(e.isNull()).toBeFalsy();
      
    });

    test('scale', () => {
      const c = Color.fromNumber(0x222);
      c.scale(200);
      expect(c.toString()).toEqual('#444');
      
      const d = new Color();
      expect(d.isNull()).toBeTruthy();
      d.scale(200);
      expect(d.isNull()).toBeTruthy();
    });
    
    test('multiply', () => {
      const c = Color.fromNumber(0x222);
      const nullColor = new Color();
      c.multiply(nullColor);
      expect(c.toString()).toEqual('#222');
      
      c.multiply([200,50,100]);
      expect(c.toString()).toEqual('#412');
      
      const d = new Color(100,200,50);
      c.multiply(d);
      expect(c.toString()).toEqual('#421');
      
      const e = new Color();
      e.multiply(d);
      expect(e.isNull()).toBeTruthy();
    });

    test('normalize', () => {
      const c = Color.fromArray([200,100,50]);
      expect(c.toString()).toEqual('#ff8');
      c.normalize();
      expect(c.toString()).toEqual('#f84');
      
      const d = new Color();
      expect(d.isNull()).toBeTruthy();
      d.normalize();
      expect(d.isNull()).toBeTruthy();
      
      const e = new Color(50, 50, 50);
      e.normalize();
      expect(e.toString()).toEqual('#888');
    });
    
    test('toString', () => {
      const c = new Color();
      expect(c.isNull()).toBeTruthy();
      expect(c.toString()).toEqual('null color');
    });

    test('rgb hsl', () => {
      const c = Color.fromString('#f80');
      expect(c.r).toEqual(255);
      expect(c.g).toEqual(135);  // 256 vs 100 rounding
      expect(c.b).toEqual(0);
      
      expect(c.h).toEqual(32);  // rounding
      expect(c.s).toEqual(100);
      expect(c.l).toEqual(50);
    });
    
    test('hsl', () => {
      const c = Color.from(0xFFF);
      expect(c.s).toEqual(0);

      // (A) If R ≥ G ≥ B  |  H = 60° x [(G-B)/(R-B)]
      c.setRGB(255, 128, 0);
      expect(c.h).toEqual(30);
      
      // (B) If G > R ≥ B  |  H = 60° x [2 - (R-B)/(G-B)]
      c.setRGB(128, 255, 0);
      expect(c.h).toEqual(90);
      
      // (C) If G ≥ B > R  |  H = 60° x [2 + (B-R)/(G-R)]
      c.setRGB(0, 255, 128);
      expect(c.h).toEqual(150);

      // (D) If B > G > R  |  H = 60° x [4 - (G-R)/(B-R)]
      c.setRGB(0, 128, 255);
      expect(c.h).toEqual(210);

      // (E) If B > R ≥ G  |  H = 60° x [4 + (R-G)/(B-G)]
      c.setRGB(128, 0, 255);
      expect(c.h).toEqual(270);

      // (F) If R ≥ B > G  |  H = 60° x [6 - (B-G)/(R-G)]
      c.setRGB(255, 0, 128);
      expect(c.h).toEqual(330);
    });
    

    test('separate', () => {
      const a = Color.fromString('#f80');
      const b = Color.fromString('#d73');
      Color.separate(a, b);
      expect(a.toString()).toEqual('#fb6');
      expect(b.toString()).toEqual('#742');
      
      const c = new Color();
      Color.separate(a, c);
      expect(a.toString()).toEqual('#fb6');
      expect(c.isNull()).toBeTruthy();

      Color.separate(c, b);
      expect(b.toString()).toEqual('#742');
      expect(c.isNull()).toBeTruthy();
      
    });

    test('separate - 2 (far enough apart)', () => {
      const a = Color.fromString('#ff0');
      const b = Color.fromString('#d79');
      Color.separate(a, b);
      expect(a.toString()).toEqual('#ff0');
      expect(b.toString()).toEqual('#d79');
    });
    
    test('separate - 3', () => {
      const a = Color.fromString('#660');
      const b = Color.fromString('#5f0');
      Color.separate(a, b);
      expect(a.toString()).toEqual('#550');
      expect(b.toString()).toEqual('#6f2');
    });

    test('separate 3', () => {
      const a = Color.fromString('#33F');
      const b = Color.fromString('#006');
      Color.separate(a, b);
      expect(a.toString()).toEqual('#33f');
      expect(b.toString()).toEqual('#006');
    });

});
