import * as Sprite from "./sprite";
import { colors } from "./color";

describe("Sprite", () => {
  // const NONE = colors.NONE;

  test("make", () => {
    const a = Sprite.make();
    // expect(a).toEqual({ ch: null, fg: NONE, bg: NONE, opacity: 100 });
    expect(a.ch).toEqual(null);
    expect(a.fg.isNull()).toBeTruthy();
    expect(a.bg.isNull()).toBeTruthy();
    expect(a.opacity).toEqual(100);

    const b = Sprite.make("@", "green", "blue", 50);
    expect(b.ch).toEqual("@");
    expect(b.fg).toBe(colors.green);
    expect(b.bg).toBe(colors.blue);
    expect(b.opacity).toEqual(50);
    expect(b.toString()).toEqual("{ ch: @, fg: green, bg: blue, opacity: 50 }");

    const d = Sprite.make("@", [100, 0, 0], [0, 0, 100], 50);
    expect(d.ch).toEqual("@");
    expect(d.fg.toInt()).toEqual(colors.red.toInt());
    expect(d.fg).not.toBe(colors.red);
    expect(d.bg.toInt()).toEqual(colors.blue.toInt());
    expect(d.bg).not.toBe(colors.blue);
    expect(d.opacity).toEqual(50);

    const e = Sprite.make(null, null, "green", 50);
    expect(e.ch).toEqual(null);
    expect(e.fg.isNull()).toBeTruthy();
    expect(e.bg).toBe(colors.green);
    expect(e.opacity).toEqual(50);

    const f = Sprite.make("@", null, null, 50);
    expect(f.ch).toEqual("@");
    expect(f.fg.isNull()).toBeTruthy();
    expect(f.bg.isNull()).toBeTruthy();
    expect(f.opacity).toEqual(50);

    const g = Sprite.make({ ch: "@", fg: "green" });
    expect(g.ch).toEqual("@");
    expect(g.fg).toBe(colors.green);
    expect(g.bg.isNull()).toBeTruthy();
    expect(g.opacity).toEqual(100);

    const h = Sprite.make({});
    expect(h.ch).toEqual(null);
    expect(h.fg.isNull()).toBeTruthy();
    expect(h.bg.isNull()).toBeTruthy();
    expect(h.opacity).toEqual(100);

    const i = Sprite.make(null, null, null);
    expect(i.ch).toEqual(null);
    expect(i.fg.isNull()).toBeTruthy();
    expect(i.bg.isNull()).toBeTruthy();
    expect(i.opacity).toEqual(100);

    // const j = Sprite.make(undefined);
    // expect(j).toEqual({});

    const k = Sprite.make(["$", "blue"]);
    expect(k.ch).toEqual("$");
    expect(k.fg).toBe(colors.blue);
    expect(k.bg.isNull()).toBeTruthy();
    expect(k.opacity).toEqual(100);

    const l = Sprite.make(["blue"]);
    expect(l.ch).toEqual(null);
    expect(l.fg.isNull()).toBeTruthy();
    expect(l.bg).toBe(colors.blue);
    expect(l.opacity).toEqual(100);

    const m = Sprite.make("@", "blue", -1);
    expect(m.ch).toEqual("@");
    expect(m.fg).toBe(colors.blue);
    expect(m.bg.isNull()).toBeTruthy();
    expect(m.opacity).toEqual(100);

    const n = Sprite.make("@");
    expect(n.ch).toEqual("@");
    expect(n.fg).toBe(colors.white);
    expect(n.bg.isNull()).toBeTruthy();
    expect(n.opacity).toEqual(100);
  });

  test("clone", () => {
    const sprite = Sprite.make("T", "red", "blue");
    const clone = sprite.clone();
    expect(clone.ch).toEqual(sprite.ch);
    expect(clone.fg).toEqual(sprite.fg);
    expect(clone.bg).toEqual(sprite.bg);
    expect(clone.opacity).toEqual(sprite.opacity);
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
    expect(d.fg.toInt()).toEqual(colors.red.toInt());
    expect(d.bg.isNull()).toBeTruthy();
    expect(d.opacity).toEqual(50);

    const e = Sprite.install("TEST", null, null, "green", 50);
    expect(e.ch).toEqual(null);
    expect(e.fg.isNull()).toBeTruthy();
    expect(e.bg).toBe(colors.green);
    expect(e.opacity).toEqual(50);

    const f = Sprite.install("TEST", "@", null, null, 50);
    expect(f.ch).toEqual("@");
    expect(f.fg.isNull()).toBeTruthy();
    expect(f.bg.isNull()).toBeTruthy();
    expect(f.opacity).toEqual(50);

    const g = Sprite.install("TEST", { ch: "@", fg: "green" });
    expect(g.ch).toEqual("@");
    expect(g.fg).toBe(colors.green);
    expect(g.bg.isNull()).toBeTruthy();
    expect(g.opacity).toEqual(100);

    // const h = Sprite.install("TEST", colors.white);
    // expect(h.ch).toEqual(100);
    // expect(h.bg).toBe(colors.white);
    // expect(h.fg).toEqual(100);
    // expect(h.opacity).toEqual(100);

    const i = Sprite.install("TEST", null, null, null);
    expect(i.ch).toEqual(null);
    expect(i.fg.isNull()).toBeTruthy();
    expect(i.bg.isNull()).toBeTruthy();
    expect(i.opacity).toEqual(100);
    expect(i.name).toEqual("TEST");

    // const j = Sprite.install("TEST", undefined);
    // expect(j).toEqual({});

    const k = Sprite.install("TEST", ["$", "blue"]);
    expect(k.ch).toEqual("$");
    expect(k.fg).toBe(colors.blue);
    expect(k.bg.isNull()).toBeTruthy();
    expect(k.opacity).toEqual(100);

    const l = Sprite.install("TEST", ["blue"]);
    expect(l.ch).toEqual(null);
    expect(l.fg.isNull()).toBeTruthy();
    expect(l.bg).toBe(colors.blue);
    expect(l.opacity).toEqual(100);

    const m = Sprite.install("miss", "green", 50);
    expect(m.ch).toEqual(null);
    expect(m.fg.isNull()).toBeTruthy();
    expect(m.bg).toBe(colors.green);
    expect(m.opacity).toEqual(50);

    const w = Sprite.install("hilite", colors.white);
    expect(w.ch).toEqual(null);
    expect(w.fg.isNull()).toBeTruthy();
    expect(w.bg).toBe(colors.white);
    expect(w.opacity).toEqual(100);

    const x = Sprite.from("hilite");
    expect(x).toBe(w);
  });

  test("from", () => {
    const made = Sprite.from({ ch: "A", fg: 0xf00 });
    expect(made.ch).toEqual("A");
    expect(made.fg.toInt()).toEqual(0xf00);
    expect(made.bg.toInt()).toEqual(-1);
    expect(made.opacity).toEqual(100);

    expect(() => Sprite.from("UNKNOWN")).toThrow();
  });

  test("constructor", () => {
    const sprite = new Sprite.Sprite();
    expect(sprite.toString()).toEqual("{  }");
  });

  test("toString", () => {
    const sprite = Sprite.make({ ch: "A", fg: 0x800, opacity: 50 });
    expect(sprite.toString()).toEqual("{ ch: A, fg: #800, opacity: 50 }");
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
