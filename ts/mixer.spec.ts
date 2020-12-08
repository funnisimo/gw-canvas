
import { Color } from './color';
import { Mixer } from './mixer';
import { options } from './config';


describe('Mixer', () => {

  let random: () => number;
  
  beforeAll(() => {
    random = options.random;
    options.random = jest.fn().mockReturnValue(0.5);
  });
  
  afterAll(() => {
    options.random = random;
  });

  test('create', () => {
    const mixer = new Mixer();
    expect(mixer.ch).toEqual(-1);
    expect(mixer.fg.isNull()).toBeTruthy();
    expect(mixer.bg.isNull()).toBeTruthy();
  });
  
  test('copy', () => {
    const a = new Mixer();
    a.draw('@', 0xFFF, 0x333);
    expect(a.ch).toEqual('@');
    expect(a.fg.toString()).toEqual('#fff');
    expect(a.bg.toString()).toEqual('#333');
    
    const b = new Mixer();
    b.copy(a);
    expect(b.ch).toEqual('@');
    expect(b.fg.toString()).toEqual('#fff');
    expect(b.bg.toString()).toEqual('#333');
  });
  
  test('clone', () => {
    const a = new Mixer();
    a.draw('@', 0xFFF, 0x333);
    expect(a.ch).toEqual('@');
    expect(a.fg.toString()).toEqual('#fff');
    expect(a.bg.toString()).toEqual('#333');

    const b = a.clone();
    expect(b.ch).toEqual('@');
    expect(b.fg.toString()).toEqual('#fff');
    expect(b.bg.toString()).toEqual('#333');
  });
  
  test('nullify', () => {
    const a = new Mixer();
    a.draw('@', 0xFFF, 0x333);
    expect(a.ch).toEqual('@');
    expect(a.fg.toString()).toEqual('#fff');
    expect(a.bg.toString()).toEqual('#333');

    a.nullify();
    expect(a.ch).toEqual(-1);
    expect(a.fg.toInt()).toEqual(-1);
    expect(a.bg.toInt()).toEqual(-1);
  });
  
  test('blackOut', () => {
    const a = new Mixer();
    a.draw('@', 0xFFF, 0x333);
    expect(a.ch).toEqual('@');
    expect(a.fg.toString()).toEqual('#fff');
    expect(a.bg.toString()).toEqual('#333');

    a.blackOut();
    expect(a.ch).toEqual(0);
    expect(a.fg.toInt()).toEqual(0);
    expect(a.bg.toInt()).toEqual(0);
  });
  
  test('draw', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');
    
    mixer.draw(-1, 0x00F, 0x666);
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#00f');
    expect(mixer.bg.toString()).toEqual('#666');

    mixer.draw('!');
    expect(mixer.ch).toEqual('!');
    expect(mixer.fg.toString()).toEqual('#00f');
    expect(mixer.bg.toString()).toEqual('#666');
    
    mixer.draw(); // does nothing (just to clear coverage report)
    expect(mixer.ch).toEqual('!');
    expect(mixer.fg.toString()).toEqual('#00f');
    expect(mixer.bg.toString()).toEqual('#666');
    
  });

  test('drawSprite', () => {
    const mixer = new Mixer();
    mixer.drawSprite({ ch:'@', fg: 0xF00, bg: Color.fromCss('#00F') });
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

    mixer.drawSprite({ glyph:100, fg: Color.fromCss('#00F'), bg: 0xFF0});
    expect(mixer.ch).toEqual(100);
    expect(mixer.fg.toString()).toEqual('#00f');
    expect(mixer.bg.toString()).toEqual('#ff0');

    // no change if no opacity
    mixer.drawSprite({ ch:'@', fg: 0xF00, bg: Color.fromCss('#00F') }, 0);
    expect(mixer.ch).toEqual(100);
    expect(mixer.fg.toString()).toEqual('#00f');
    expect(mixer.bg.toString()).toEqual('#ff0');

    mixer.drawSprite({ ch:'@', fg: 0xF00, bg: Color.fromCss('#00F') }, 50);
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#808');
    expect(mixer.bg.toString()).toEqual('#888');

    // @ts-ignore
    mixer.drawSprite({});
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#808');
    expect(mixer.bg.toString()).toEqual('#888');

  });
  
  test('invert', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');
    
    mixer.invert();
    expect(mixer.fg.toString()).toEqual('#00f');
    expect(mixer.bg.toString()).toEqual('#f00');
  });
  
  test('multiply', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

    const light = Color.fromArray([200,50,50]);
    mixer.multiply(light);
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#008');
    
    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

    mixer.multiply(light, false, true);
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#008');

    mixer.draw('@', 0x800, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#800');
    expect(mixer.bg.toString()).toEqual('#00f');

    mixer.multiply(light, true, false);
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');
    
  });
  
  test('mix', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

    const water = Color.fromNumber(0x66F);
    mixer.mix(water);
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#b38');
    expect(mixer.bg.toString()).toEqual('#33f');

    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    mixer.mix(water, 0, 0); // does nothing
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

  });
  
  test('add', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

    const water = Color.fromNumber(0x003);
    mixer.add(water);
    expect(mixer.fg.toString()).toEqual('#f03');
    expect(mixer.bg.toString()).toEqual('#00f');

    mixer.draw('@', 0xF00, Color.fromCss('#00F'));
    mixer.add(water, 0, 0); // does nothing
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');

  });
  
  test('separate', () => {
    const mixer = new Mixer();
    mixer.draw('@', Color.fromCss('#F80'), 0xD73);
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f80');
    expect(mixer.bg.toString()).toEqual('#d73');
    
    mixer.separate();
    expect(mixer.fg.toString()).toEqual('#fb6');
    expect(mixer.bg.toString()).toEqual('#742');
  });
  
  test('bake', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xD73, Color.fromArray([50,50,50,50,10,10,10]));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#d73');
    expect(mixer.bg.toString()).toEqual('#888');
    
    const data = mixer.bake();
    expect(data.ch).toEqual('@');
    expect(data.fg).toEqual(3443);
    expect(data.bg).toEqual(3276);
    expect(mixer.fg.toString()).toEqual('#d73');
    expect(mixer.bg.toString()).toEqual('#ccc');

  })
  
});
