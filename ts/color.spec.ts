
import { Color, make } from './color';

describe('Color', () => {

    test('fromArray', () => {
        const c = Color.fromArray([0,50, 100]);
        expect(c.toString()).toEqual('#08f');

        const d = Color.fromArray([0, 128, 255], true);
        expect(d.toString()).toEqual('#08f');

        const e = Color.fromArray([-10, 200, 50]);
        expect(e.equals([-10,200,50])).toBeTruthy();

        const f = Color.fromArray([-50, 510, 255], true);
        expect(f.equals([-20,200,100])).toBeTruthy();

    });

    test('make - array', () => {
        const c = make([0,50,100]);
        expect(c.toString()).toEqual('#08f');

        const d = make([0,128,255], true);
        expect(d.toString()).toEqual('#08f');
    });

    test('fromString', () => {
        const c = Color.fromString('#07F');
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = Color.fromString('#0080FF');
        expect(d.equals([0,50,100])).toBeTruthy();
    });

    test('make - string', () => {
        const c = make('#07F');
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = make('#0080FF');
        expect(d.equals([0,50,100])).toBeTruthy();
    });

    test('fromNumber', () => {
        const c = Color.fromNumber(0x07F);
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = Color.fromNumber(0x0080FF, true);
        expect(d.equals([0,50,100])).toBeTruthy();
    });

    test('make - number', () => {
        const c = make(0x07F);
        expect(c.equals([0,47,100])).toBeTruthy();

        const d = make(0x0080FF, true);
        expect(d.equals([0,50,100])).toBeTruthy();
    });

    test('equals', () => {
        const a = new Color(100, 50, 0);
        const b = new Color(100, 50, 0);
        const c = new Color(50, 50, 50);

        expect(a.equals(b)).toBeTruthy();
        expect(a.equals(c)).toBeFalsy();
        expect(a.equals([100,50,0])).toBeTruthy();
        expect(a.equals([50,50,50])).toBeFalsy();
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
    });

    test('clear', () => {
      const a = new Color(100, 50, 0);
      expect(a.toInt()).toEqual(0xF80);
      a.clear();
      expect(a.toInt()).toEqual(0x000);
    });

    test('toInt', () => {
        const c = new Color(100, 47, 0);
        expect(c.toInt()).toEqual(0xF70);
        expect(c.toInt(true)).toEqual(0xFF7800);

        const d = new Color(100, 50, 0);
        expect(d.toInt()).toEqual(0xF80);
        expect(d.toInt(true)).toEqual(0xFF8000);
    });

    test('fromInt', () => {
        const c = new Color().fromInt(0xF70);
        expect(c.toString()).toEqual('#f70')

        const d = new Color().fromInt(0xFF8000, true);
        expect(d.toString()).toEqual('#f80');
    });

    test('clamp', () => {
      const c = new Color();
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
      
      c.mix(white, 50);
      expect(c.equals([50,50,50])).toBeTruthy();
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
      c.lighten(50);
      expect(c.toString()).toEqual('#ca8');
    });
    
    test('darken', () => {
      const c = Color.fromNumber(0x8BF);
      c.darken(50);
      expect(c.toString()).toEqual('#468');
    });

    test('add', () => {
      const c = Color.fromNumber(0x444);
      expect(c.toString()).toEqual('#444');

      const d = Color.fromNumber(0x222);
      c.add(d);
      expect(c.toString()).toEqual('#666');
      
      c.add([47,47,47]);
      expect(c.toString()).toEqual('#ddd');
    });

    test('scale', () => {
      const c = Color.fromNumber(0x222);
      c.scale(200);
      expect(c.toString()).toEqual('#444');
    });
    
    test('multiply', () => {
      const c = Color.fromNumber(0x222);
      c.multiply([200,50,100]);
      expect(c.toString()).toEqual('#412');
      
      const d = new Color(100,200,50);
      c.multiply(d);
      expect(c.toString()).toEqual('#421')
    });

});
