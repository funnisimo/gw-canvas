import "jest-extended";
import * as Color from "./color";
// import { cosmetic } from "../rng";

describe("Color", () => {
  // beforeEach(() => {
  //   jest
  //     .spyOn(cosmetic, "number")
  //     .mockImplementation((n?: number) => (n ? Math.floor(n / 2) : 0));
  // });

  // afterAll(() => {
  //   jest.resetAllMocks();
  // });

  test("make - color", () => {
    const c = new Color.Color(100, 50, 0);
    const d = Color.make(c);
    expect(c).toBe(d); // colors are const
    expect(c.equals(d)).toBeTruthy();
    expect(c.css()).toEqual("#f80");

    // @ts-ignore
    expect(() => Color.make({})).toThrow();

    const e = Color.make();
    expect(e.isNull()).toBeTruthy();

    const f = Color.make(null);
    expect(f.isNull()).toBeTruthy();

    const g = Color.make(undefined);
    expect(g.isNull()).toBeTruthy();

    const h = Color.make(50, 100, 25);
    expect(h.css()).toEqual("#8f4");
  });

  test("install", () => {
    const c = Color.install("test", 50, 50, 100);
    expect(c.css()).toEqual("#88f");
    expect(Color.colors.test).toBe(c);

    const d = Color.install("test", [50, 50, 100]);
    expect(d.css()).toEqual("#88f");
    expect(Color.colors.test).toBe(d);

    const e = Color.install("test", "#88f");
    expect(e.css()).toEqual("#88f");
    expect(Color.colors.test).toBe(e);
  });

  test("fromArray", () => {
    const c = Color.fromArray([0, 50, 100]);
    expect(c.toString()).toEqual("#08f");

    const d = Color.fromArray([0, 128, 255], true);
    expect(d.toString()).toEqual("#08f");

    const e = Color.fromArray([-10, 200, 50]);
    expect(e.equals([-10, 200, 50])).toBeTruthy();

    const f = Color.fromArray([-50, 510, 255], true);
    expect(f.equals([-20, 200, 100])).toBeTruthy();

    // @ts-ignore
    expect(Color.fromArray([]).toString()).toEqual("#000");
  });

  test("make - array", () => {
    const c = Color.make([0, 50, 100]);
    expect(c.toString()).toEqual("#08f");

    const d = Color.make([0, 128, 255], true);
    expect(d.toString()).toEqual("#08f");
  });

  test("fromCss", () => {
    const c = Color.fromCss("#07F");
    expect(c.equals([0, 47, 100])).toBeTruthy();

    const d = Color.fromCss("#0080FF");
    expect(d.equals([0, 50, 100])).toBeTruthy();

    expect(() => Color.fromCss("black")).toThrow();
  });

  test("make - string", () => {
    const c = Color.make("#07F");
    expect(c.equals([0, 47, 100])).toBeTruthy();

    const d = Color.make("#0080FF");
    expect(d.equals([0, 50, 100])).toBeTruthy();
  });

  test("fromNumber", () => {
    const c = Color.fromNumber(0x07f);
    expect(c.equals([0, 47, 100])).toBeTruthy();

    const d = Color.fromNumber(0x0080ff, true);
    expect(d.equals([0, 50, 100])).toBeTruthy();
  });

  test("make - number", () => {
    const c = Color.make(0x07f);
    expect(c.equals([0, 47, 100])).toBeTruthy();

    const d = Color.make(0x0080ff, true);
    expect(d.equals([0, 50, 100])).toBeTruthy();

    const e = Color.make(0x202020); // automatic base256 detect (> 0xFFF)
    expect(e.toString()).toEqual("#222");
  });

  test("from", () => {
    const c = Color.from(-1);
    expect(c.isNull()).toBeTruthy();

    expect(Color.from("red")).toBe(Color.colors.red);
  });

  test("equals", () => {
    const a = new Color.Color(100, 50, 0);
    const b = new Color.Color(100, 50, 0);
    const c = new Color.Color(50, 50, 50);
    const d = new Color.Color();

    expect(a.equals(b)).toBeTruthy();
    expect(a.equals(c)).toBeFalsy();
    expect(a.equals([100, 50, 0])).toBeTruthy();
    expect(a.equals([50, 50, 50])).toBeFalsy();
    expect(a.toString()).toEqual("#f80");
    expect(a.equals("#f80")).toBeTruthy();
    expect(a.equals(0xf80)).toBeTruthy();
    expect(a.equals(0xff8000)).toBeTruthy();
    // expect(a.toString(true)).toEqual("#ff8000");
    expect(a.equals("#ff8000")).toBeTruthy();

    // @ts-ignore
    expect(a.equals(null)).toBeFalsy();
    // @ts-ignore
    expect(a.equals()).toBeFalsy();
    expect(a.equals(d)).toBeFalsy();
    expect(d.equals(a)).toBeFalsy();

    expect(a.toInt()).toEqual(0xf80f);
    expect(a.equals(0xf80)).toBeTruthy();

    expect(Color.colors.black.equals("black")).toBeTruthy();
    expect(Color.colors.black.equals("#000")).toBeTruthy();
    expect(Color.colors.black.equals("#000000")).toBeTruthy();
  });

  test("toInt", () => {
    const c = new Color.Color(100, 47, 0);
    expect(c.toInt()).toEqual(0xf70f);
    // expect(c.toInt(true)).toEqual(0xff7800);

    const d = new Color.Color(100, 50, 0);
    expect(d.toInt()).toEqual(0xf80f);
    // expect(d.toInt(true)).toEqual(0xff8000);

    const e = new Color.Color();
    expect(e.isNull()).toBeTruthy();
    expect(e.toInt()).toEqual(0x0000);
  });

  // test('fromInt', () => {
  //     const c = new Color.Color().fromInt(0xF70);
  //     expect(c.toString()).toEqual('#f70')
  //
  //     const d = new Color.Color().fromInt(0xFF8000, true);
  //     expect(d.toString()).toEqual('#f80');
  //
  //     const e = new Color.Color(100,100,100).fromInt(-1);
  //     expect(e.isNull()).toBeTruthy();
  // });

  test("clamp", () => {
    let c = new Color.Color();
    expect(c.isNull()).toBeTruthy();
    expect(c.clamp().isNull()).toBeTruthy();

    c = Color.make(200, -100, 50);
    expect(c.clamp().equals([100, 0, 50])).toBeTruthy();
  });

  test("mix", () => {
    const c = new Color.Color();
    const white = new Color.Color(100, 100, 100);
    const black = new Color.Color(0, 0, 0);
    const red = new Color.Color(100, 0, 0);
    const blue = new Color.Color(0, 0, 100);
    const nullColor = new Color.Color();

    expect(c.isNull()).toBeTruthy();

    expect(c.mix(nullColor, 50).isNull()).toBeTruthy();

    const cw = c.mix(white, 50);
    expect(cw.equals([50, 50, 50])).toBeTruthy();
    expect(cw.isNull()).toBeFalsy();

    const cr = cw.mix(red, 50);
    expect(cr.toString()).toEqual("#b44");
    // expect(cr.toString(true)).toEqual("#bf4040");

    const crk = cr.mix(black, 50);
    expect(crk.toString()).toEqual("#622");

    const crkb = crk.mix(blue, 50);
    expect(crkb.toString()).toEqual("#319");
  });

  test("lighten", () => {
    const c = Color.fromNumber(0x840);
    expect(c.lighten(0).toString()).toEqual("#840");
    expect(c.lighten(50).toString()).toEqual("#ca8");

    const d = new Color.Color();
    expect(d.isNull()).toBeTruthy();
    expect(d.lighten(50).isNull()).toBeTruthy();
  });

  test("darken", () => {
    const c = Color.fromNumber(0x8bf);
    expect(c.darken(0).toString()).toEqual("#8bf");
    expect(c.darken(50).toString()).toEqual("#468");

    const d = new Color.Color();
    expect(d.isNull()).toBeTruthy();
    expect(d.darken(50).isNull()).toBeTruthy();
  });

  // test("bake", () => {
  //   const c = new Color.Color(0, 0, 0).rand(20, 10, 10, 10);
  //   expect(c.css()).toEqual("#000");
  //   const cb = c.bake();
  //   expect(cb.css()).not.toEqual("#000");
  //   expect(cb.r).toBeWithin(0, 256);
  //   expect(cb.g).toBeWithin(0, 256);
  //   expect(cb.b).toBeWithin(0, 256);

  //   const d = new Color.Color();
  //   expect(d.isNull()).toBeTruthy();
  //   expect(d.bake().isNull()).toBeTruthy();

  //   const e = Color.fromArray([50, 50, 50]);
  //   expect(e.bake().toString()).toEqual("#888");

  //   const f = Color.from("#888").dance(10, 10, 10, 10);
  //   const fb = f.bake();
  //   expect(fb.toString()).toEqual("#999"); // dancing colors change every time you get the value
  //   expect(fb._r).toEqual(53);
  //   expect(fb._g).toEqual(53);
  //   expect(fb._b).toEqual(53);
  // });

  test("add", () => {
    const c = Color.fromNumber(0x444);
    const nullColor = new Color.Color();
    const cn = c.add(nullColor);
    expect(cn.toString()).toEqual("#444");

    const d = Color.fromNumber(0x222);
    const cd = c.add(d);
    expect(cd.toString()).toEqual("#666");

    const cd2 = cd.add([47, 47, 47]);
    expect(cd2.toString()).toEqual("#ddd");

    const e = new Color.Color();
    expect(e.isNull()).toBeTruthy();
    const ed = e.add(d, 50);
    expect(ed.toString()).toEqual("#1118");
    expect(ed.isNull()).toBeFalsy();
  });

  test("scale", () => {
    const c = Color.fromNumber(0x222);
    expect(c.scale(200).toString()).toEqual("#444");

    const d = new Color.Color();
    expect(d.isNull()).toBeTruthy();
    expect(d.scale(200).isNull()).toBeTruthy();
  });

  test("multiply", () => {
    const c = Color.fromNumber(0x222);
    const nullColor = new Color.Color();
    const cn = c.multiply(nullColor);
    expect(cn.toString()).toEqual("#222");

    const c2 = c.multiply([200, 50, 100]);
    expect(c2.toString()).toEqual("#412");

    const d = new Color.Color(100, 200, 50);
    const c2d = c2.multiply(d);
    expect(c2d.toString()).toEqual("#421");

    const e = new Color.Color();
    const ed = e.multiply(d);
    expect(ed.isNull()).toBeTruthy();
  });

  test("normalize", () => {
    const c = Color.fromArray([200, 100, 50]);
    expect(c.toString()).toEqual("#ff8");
    expect(c.normalize().toString()).toEqual("#f84");

    const d = new Color.Color();
    expect(d.isNull()).toBeTruthy();
    expect(d.normalize().isNull()).toBeTruthy();

    const e = new Color.Color(50, 50, 50);
    expect(e.normalize().toString()).toEqual("#888");
  });

  test("toString", () => {
    const c = new Color.Color();
    expect(c.isNull()).toBeTruthy();
    expect(c.toString()).toEqual("#0000");

    const d = Color.colors.teal;
    expect(d.toString()).toEqual("teal");
    expect(d.css()).toEqual("#5ff");
  });

  test("css", () => {
    const c = Color.from(-1);
    expect(c.css()).toEqual("#0000");
  });

  test("rgb hsl", () => {
    const c = Color.fromCss("#f80");
    expect(c.r).toEqual(100);
    expect(c.g).toEqual(53); // 256 vs 100 rounding
    expect(c.b).toEqual(0);

    expect(c.h).toEqual(32); // rounding
    expect(c.s).toEqual(100);
    expect(c.l).toEqual(50);
  });

  test("hsl", () => {
    let c = Color.from(0xfff);
    expect(c.s).toEqual(0);

    // (A) If R ≥ G ≥ B  |  H = 60° x [(G-B)/(R-B)]
    c = Color.make(255, 128, 0);
    expect(c.h).toEqual(30);

    // (B) If G > R ≥ B  |  H = 60° x [2 - (R-B)/(G-B)]
    c = Color.make(128, 255, 0);
    expect(c.h).toEqual(90);

    // (C) If G ≥ B > R  |  H = 60° x [2 + (B-R)/(G-R)]
    c = Color.make(0, 255, 128);
    expect(c.h).toEqual(150);

    // (D) If B > G > R  |  H = 60° x [4 - (G-R)/(B-R)]
    c = Color.make(0, 128, 255);
    expect(c.h).toEqual(210);

    // (E) If B > R ≥ G  |  H = 60° x [4 + (R-G)/(B-G)]
    c = Color.make(128, 0, 255);
    expect(c.h).toEqual(270);

    // (F) If R ≥ B > G  |  H = 60° x [6 - (B-G)/(R-G)]
    c = Color.make(255, 0, 128);
    expect(c.h).toEqual(330);
  });

  test("separate", () => {
    let a = Color.fromCss("#f80");
    let b = Color.fromCss("#d73");
    [a, b] = Color.separate(a, b);
    expect(a.toString()).toEqual("#fb6");
    expect(b.toString()).toEqual("#742");

    let c = new Color.Color();
    [a, c] = Color.separate(a, c);
    expect(a.toString()).toEqual("#fb6");
    expect(c.isNull()).toBeTruthy();

    [c, b] = Color.separate(c, b);
    expect(b.toString()).toEqual("#742");
    expect(c.isNull()).toBeTruthy();
  });

  test("separate - 2 (far enough apart)", () => {
    let a = Color.fromCss("#ff0");
    let b = Color.fromCss("#d79");
    [a, b] = Color.separate(a, b);
    expect(a.toString()).toEqual("#ff0");
    expect(b.toString()).toEqual("#d79");
  });

  test("separate - 3", () => {
    let a = Color.fromCss("#660");
    let b = Color.fromCss("#5f0");
    [a, b] = Color.separate(a, b);
    expect(a.toString()).toEqual("#550");
    expect(b.toString()).toEqual("#6f2");
  });

  test("separate 3", () => {
    let a = Color.fromCss("#33F");
    let b = Color.fromCss("#006");
    [a, b] = Color.separate(a, b);
    expect(a.toString()).toEqual("#33f");
    expect(b.toString()).toEqual("#006");
  });

  test("fromName", () => {
    expect(() => Color.from("taco")).toThrow();
    expect(() => Color.make("taco")).toThrow();
  });

  test("fromNumber", () => {
    const c = Color.from(-4);
    expect(c.isNull()).toBeTruthy();
  });

  test("relativeLuminance", () => {
    const C = Color.colors;
    expect(Color.relativeLuminance(C.white, C.black)).toEqual(100);
    expect(Color.relativeLuminance(C.white, C.gray)).toEqual(25);
    expect(Color.relativeLuminance(C.white, C.red)).toEqual(79);
    expect(Color.relativeLuminance(C.white, C.green)).toEqual(28);
    expect(Color.relativeLuminance(C.white, C.blue)).toEqual(93);
    expect(Color.relativeLuminance(C.black, C.red)).toEqual(21);
    expect(Color.relativeLuminance(C.black, C.green)).toEqual(72);
    expect(Color.relativeLuminance(C.black, C.blue)).toEqual(7);
    expect(Color.relativeLuminance(C.red, C.red)).toEqual(0);
    expect(Color.relativeLuminance(C.red, C.green)).toEqual(93);
    expect(Color.relativeLuminance(C.red, C.blue)).toEqual(28);
    expect(Color.relativeLuminance(C.green, C.red)).toEqual(93);
    expect(Color.relativeLuminance(C.green, C.green)).toEqual(0);
    expect(Color.relativeLuminance(C.green, C.blue)).toEqual(79);
    expect(Color.relativeLuminance(C.blue, C.red)).toEqual(28);
    expect(Color.relativeLuminance(C.blue, C.green)).toEqual(79);
    expect(Color.relativeLuminance(C.blue, C.blue)).toEqual(0);
  });

  test("distance", () => {
    const C = Color.colors;
    expect(Color.distance(C.white, C.black)).toEqual(100);
    expect(Color.distance(C.white, C.gray)).toEqual(25);
    expect(Color.distance(C.white, C.red)).toEqual(67);
    expect(Color.distance(C.white, C.green)).toEqual(67);
    expect(Color.distance(C.white, C.blue)).toEqual(67);
    expect(Color.distance(C.black, C.red)).toEqual(33);
    expect(Color.distance(C.black, C.green)).toEqual(33);
    expect(Color.distance(C.black, C.blue)).toEqual(33);
    expect(Color.distance(C.red, C.red)).toEqual(0);
    expect(Color.distance(C.red, C.green)).toEqual(67);
    expect(Color.distance(C.red, C.blue)).toEqual(67);
    expect(Color.distance(C.green, C.red)).toEqual(67);
    expect(Color.distance(C.green, C.green)).toEqual(0);
    expect(Color.distance(C.green, C.blue)).toEqual(67);
    expect(Color.distance(C.blue, C.red)).toEqual(67);
    expect(Color.distance(C.blue, C.green)).toEqual(67);
    expect(Color.distance(C.blue, C.blue)).toEqual(0);
  });

  test("installSpread", () => {
    Color.installSpread("test", 75, 75, 25);
    expect(Color.colors.test).toBeObject();
    expect(Color.colors.dark_test).toBeObject();
    expect(Color.colors.light_test).toBeObject();
  });

  test("smoothScalar", () => {
    expect(Color.smoothScalar(100)).toEqual(0);
    expect(Color.smoothScalar(50)).toEqual(100);
    expect(Color.smoothScalar(0)).toEqual(0);

    expect(Color.smoothScalar(100, 100)).toEqual(0);
    expect(Color.smoothScalar(50, 100)).toEqual(100);
    expect(Color.smoothScalar(0, 100)).toEqual(0);
  });

  test("toLight", () => {
    const c = Color.from("#f00");
    expect(c.toLight()).toEqual([100, 0, 0]);
  });
});
