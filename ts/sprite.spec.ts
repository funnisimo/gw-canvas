import { Sprite } from "./sprite";
import { colors } from "./color";

describe("Sprite", () => {
  test("make", () => {
    const a = Sprite.make();
    expect(a).toEqual({ ch: null, fg: -1, bg: -1 });

    const b = Sprite.make("@", "green", "blue", 50);
    expect(b.ch).toEqual("@");
    expect(b.fg).toBe(colors.green);
    expect(b.bg).toBe(colors.blue);
    expect(b.opacity).toEqual(50);

    const d = Sprite.make("@", [100, 0, 0], null, 50);
    expect(d.ch).toEqual("@");
    expect(d.fg).toEqual(colors.red);
    expect(d.bg).toEqual(-1);
    expect(d.opacity).toEqual(50);

    const e = Sprite.make(null, null, "green", 50);
    expect(e.ch).toBeNull();
    expect(e.fg).toEqual(-1);
    expect(e.bg).toBe(colors.green);
    expect(e.opacity).toEqual(50);

    const f = Sprite.make("@", null, null, 50);
    expect(f.ch).toEqual("@");
    expect(f.fg).toEqual(-1);
    expect(f.bg).toEqual(-1);
    expect(f.opacity).toEqual(50);

    const g = Sprite.make({ ch: "@", fg: "green" });
    expect(g.ch).toEqual("@");
    expect(g.fg).toBe(colors.green);
    expect(g.bg).toEqual(-1);
    expect(g.opacity).toBeUndefined();

    const i = Sprite.make(null, null, null);
    expect(i).toEqual({ ch: null, fg: -1, bg: -1 });

    // const j = Sprite.make(undefined);
    // expect(j).toEqual({});

    const k = Sprite.make(["$", "blue"]);
    expect(k.ch).toEqual("$");
    expect(k.fg).toBe(colors.blue);
    expect(k.bg).toEqual(-1);
    expect(k.opacity).toBeUndefined();

    const l = Sprite.make(["blue"]);
    expect(l.ch).toBeNull();
    expect(l.fg).toEqual(-1);
    expect(l.bg).toBe(colors.blue);
    expect(l.opacity).toBeUndefined();
  });

  test("install", () => {
    // const a = Sprite.install("TEST");
    // expect(a).toEqual({});

    const b = Sprite.install("TEST", "@", "green", "blue", 50);
    expect(b.ch).toEqual("@");
    expect(b.fg).toBe(colors.green);
    expect(b.bg).toBe(colors.blue);
    expect(b.opacity).toEqual(50);

    const d = Sprite.install("TEST", "@", [100, 0, 0], null, 50);
    expect(d.ch).toEqual("@");
    expect(d.fg).toEqual(colors.red);
    expect(d.bg).toEqual(-1);
    expect(d.opacity).toEqual(50);

    const e = Sprite.install("TEST", null, null, "green", 50);
    expect(e.ch).toBeNull();
    expect(e.fg).toEqual(-1);
    expect(e.bg).toBe(colors.green);
    expect(e.opacity).toEqual(50);

    const f = Sprite.install("TEST", "@", null, null, 50);
    expect(f.ch).toEqual("@");
    expect(f.fg).toEqual(-1);
    expect(f.bg).toEqual(-1);
    expect(f.opacity).toEqual(50);

    const g = Sprite.install("TEST", { ch: "@", fg: "green" });
    expect(g.ch).toEqual("@");
    expect(g.fg).toBe(colors.green);
    expect(g.bg).toEqual(-1);
    expect(g.opacity).toBeUndefined();

    // const h = Sprite.install("TEST", colors.white);
    // expect(h.ch).toBeUndefined();
    // expect(h.bg).toBe(colors.white);
    // expect(h.fg).toBeUndefined();
    // expect(h.opacity).toBeUndefined();

    const i = Sprite.install("TEST", null, null, null);
    expect(i).toEqual({ ch: null, fg: -1, bg: -1, name: "TEST" });

    // const j = Sprite.install("TEST", undefined);
    // expect(j).toEqual({});

    const k = Sprite.install("TEST", ["$", "blue"]);
    expect(k.ch).toEqual("$");
    expect(k.fg).toBe(colors.blue);
    expect(k.bg).toEqual(-1);
    expect(k.opacity).toBeUndefined();

    const l = Sprite.install("TEST", ["blue"]);
    expect(l.ch).toBeNull();
    expect(l.fg).toEqual(-1);
    expect(l.bg).toBe(colors.blue);
    expect(l.opacity).toBeUndefined();
  });

  //   test("copy", () => {
  //     const b = new Sprite("@", "green", "blue", 50);

  //     b.copy({ ch: "!" });
  //     expect(b.ch).toEqual("!");
  //     expect(b.fg.isNull()).toBeTruthy();
  //     expect(b.bg.isNull()).toBeTruthy();
  //     expect(b.opacity).toEqual(100);

  //     b.copy({ fg: "red" });
  //     expect(b.ch).toEqual(" ");
  //     expect(b.fg).toEqual(colors.red);
  //     expect(b.bg.isNull()).toBeTruthy();

  //     b.copy({ fg: "white", bg: null });
  //     expect(b.ch).toEqual(" ");
  //     expect(b.fg).toEqual(colors.white);
  //     expect(b.bg.isNull()).toBeTruthy();

  //     b.copy({ fg: "red", bg: "blue" });
  //     expect(b.ch).toEqual(" ");
  //     expect(b.fg).toEqual(colors.red);
  //     expect(b.bg).toEqual(colors.blue);
  //   });

  //   test("plot", () => {
  //     const s = new Sprite("@", [100, 0, 0], [50, 50, 50]);
  //     const t = Sprite.make("$", [0, 100, 0], [0, 100, 50], 50);
  //     expect(t.opacity).toEqual(50);
  //     s.needsUpdate = false;

  //     s.drawSprite(t);
  //     expect(s.needsUpdate).toBeTruthy();

  //     expect(s.ch).toEqual("$");
  //     expect(s.fg.toString(true)).toEqual("#808000"); // mixes fgs
  //     expect(s.bg.toString(true)).toEqual("#40bf80"); // mixes bgs
  //   });

  //   test("plot with alpha", () => {
  //     const s = new Sprite("@", [100, 0, 0], [50, 50, 50]);
  //     const t = Sprite.make("$", [0, 100, 0], [0, 100, 50], 50);
  //     expect(t.opacity).toEqual(50);
  //     s.needsUpdate = false;

  //     expect(s.fg.toString(true)).toEqual("#ff0000");
  //     expect(s.bg.toString(true)).toEqual("#808080");

  //     expect(t.fg.toString(true)).toEqual("#00ff00");
  //     expect(t.bg.toString(true)).toEqual("#00ff80");

  //     s.drawSprite(t, 50);
  //     expect(s.needsUpdate).toBeTruthy();

  //     expect(s.ch).toEqual("$");
  //     expect(s.fg.toString(true)).toEqual("#808000"); // mixes 50% of t fg
  //     expect(s.bg.toString(true)).toEqual("#40bf80"); // mixes 50% of t bg
  //   });

  //   test("plotting w/o fg/bg", () => {
  //     const dest = new Sprite();
  //     const tile = Sprite.make(null, null, "green"); // bg
  //     const player = Sprite.make("@", "white", null);

  //     dest.drawSprite(tile);
  //     dest.drawSprite(player);

  //     expect(dest.ch).toEqual("@");
  //     expect(dest.fg.toString(true)).toEqual("#ffffff");
  //     expect(dest.bg.toString(true)).toEqual("#00ff00");
  //     expect(dest.opacity).toEqual(100);
  //     expect(dest.needsUpdate).toBeTruthy();
  //   });

  //   test("plotting with opacity", () => {
  //     const dest = new Sprite();
  //     const tile = Sprite.make("green"); // bg
  //     const player = Sprite.make("@", "white");
  //     const fx = Sprite.make("red", 50); // bg

  //     dest.drawSprite(tile);
  //     dest.drawSprite(player);
  //     dest.drawSprite(fx);

  //     expect(dest.ch).toEqual("@");
  //     expect(dest.fg.toString(true)).toEqual("#ffffff");
  //     expect(dest.bg.toString(true)).toEqual("#808000");
  //     expect(dest.opacity).toEqual(100);
  //     expect(dest.needsUpdate).toBeTruthy();
  //   });

  //   test("plotting just fg", () => {
  //     const dest = new Sprite();
  //     const tile = Sprite.make("green"); // bg
  //     const player = Sprite.make("@", "white");
  //     const fx = Sprite.make(null, "red", 50);

  //     dest.drawSprite(tile);
  //     dest.drawSprite(player);
  //     dest.drawSprite(fx);

  //     expect(dest.ch).toEqual("@");
  //     expect(dest.fg.toString(true)).toEqual("#ff8080"); // (white + red) / 2
  //     expect(dest.bg.toString(true)).toEqual("#00ff00");
  //     expect(dest.opacity).toEqual(100);
  //     expect(dest.needsUpdate).toBeTruthy();
  //   });

  // test('will track hanging letter changes in plotChar', () => {
  //   const s = Sprite.make('@', 'red');
  //   expect(s.wasHanging).toBeFalsy();
  //   s.draw('|');
  //   expect(s.wasHanging).toBeTruthy();
  //   s.draw('@');
  //   expect(s.wasHanging).toBeTruthy();
  //   s.draw('o');
  //   expect(s.wasHanging).toBeTruthy();  // does not get turned off automatically
  //   s.nullify();
  //   expect(s.wasHanging).toBeTruthy();  // does not get nullified
  //
  //   s.wasHanging = false;
  //   s.draw('|');
  //   expect(s.wasHanging).toBeTruthy();
  //   s.nullify();
  //   expect(s.wasHanging).toBeTruthy();  // gets set
  // });
  //
  // test('will track hanging letter changes in plot', () => {
  //   const s = Sprite.make('@', 'red');
  //   const t = Sprite.make('|', 'blue');
  //   const u = Sprite.make('o', 'orange');
  //
  //   expect(s.wasHanging).toBeFalsy();
  //   s.drawSprite(t);
  //   expect(s.wasHanging).toBeTruthy();
  //   s.drawSprite(u);
  //   expect(s.wasHanging).toBeTruthy();
  //   s.drawSprite(u);
  //   expect(s.wasHanging).toBeTruthy();  // Not auto turned off
  //   s.nullify();
  //   expect(s.wasHanging).toBeTruthy();  // does not get cleared
  // });
});
