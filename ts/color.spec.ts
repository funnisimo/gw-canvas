
import { Color, make } from './color';

describe('Color', () => {

    test('fromArray', () => {
        const c = Color.fromArray([0,50, 100]);
        expect(c.r).toEqual(0);
        expect(c.g).toEqual(50);
        expect(c.b).toEqual(100);

        const d = Color.fromArray([0, 128, 255], true);
        expect(d.r).toEqual(0);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(100);

        const e = Color.fromArray([-10, 200, 50]);
        expect(e.r).toEqual(-10);
        expect(e.g).toEqual(200);
        expect(e.b).toEqual(50);

        const f = Color.fromArray([-50, 510, 255], true);
        expect(f.r).toEqual(-20);
        expect(f.g).toEqual(200);
        expect(f.b).toEqual(100);

    });

    test('make - array', () => {
        const c = make([0,50,100]);
        expect(c.r).toEqual(0);
        expect(c.g).toEqual(50);
        expect(c.b).toEqual(100);

        const d = make([0,128,255], true);
        expect(d.r).toEqual(0);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(100);

    });

    test('fromString', () => {
        const c = Color.fromString('#07F');
        expect(c.r).toEqual(0);
        expect(c.g).toEqual(47);
        expect(c.b).toEqual(100);

        const d = Color.fromString('#0080FF');
        expect(d.r).toEqual(0);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(100);
    });

    test('make - string', () => {
        const c = make('#07F');
        expect(c.r).toEqual(0);
        expect(c.g).toEqual(47);
        expect(c.b).toEqual(100);

        const d = make('#0080FF');
        expect(d.r).toEqual(0);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(100);
    });

    test('fromNumber', () => {
        const c = Color.fromNumber(0x07F);
        expect(c.r).toEqual(0);
        expect(c.g).toEqual(47);
        expect(c.b).toEqual(100);

        const d = Color.fromNumber(0x0080FF, true);
        expect(d.r).toEqual(0);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(100);
    });

    test('make - number', () => {
        const c = make(0x07F);
        expect(c.r).toEqual(0);
        expect(c.g).toEqual(47);
        expect(c.b).toEqual(100);

        const d = make(0x0080FF, true);
        expect(d.r).toEqual(0);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(100);
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
        expect(c.r).toEqual(100);
        expect(c.g).toEqual(47);
        expect(c.b).toEqual(0);

        const d = new Color().fromInt(0xFF8000, true);
        expect(d.r).toEqual(100);
        expect(d.g).toEqual(50);
        expect(d.b).toEqual(0);
    });

});
