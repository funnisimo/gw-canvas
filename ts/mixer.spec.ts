
import { Color } from './color';
import { Mixer } from './mixer';

describe('Mixer', () => {

  test('create', () => {
    const mixer = new Mixer();
    expect(mixer.ch).toEqual(-1);
    expect(mixer.fg.isNull()).toBeTruthy();
    expect(mixer.bg.isNull()).toBeTruthy();
  });
  
  test('draw', () => {
    const mixer = new Mixer();
    mixer.draw('@', 0xF00, Color.fromString('#00F'));
    expect(mixer.ch).toEqual('@');
    expect(mixer.fg.toString()).toEqual('#f00');
    expect(mixer.bg.toString()).toEqual('#00f');
  });
  
});
