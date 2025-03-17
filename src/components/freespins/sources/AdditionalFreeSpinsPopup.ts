import { Assets, Sprite, Text, Texture } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { Gsap, GsapTween, localize } from 'gh-client-base';

export class AdditionalFreeSpinsPopup {
  protected plate = new Sprite(Texture.from('additional-fs'));

  constructor() {
    this.plate.anchor.set(0.5);
    this.plate.alpha = 0;
    LayerManager.layers.get('foreground')?.addChild(this.plate);

    const style = Assets.get('counterFontStyles').counter;

    const numberText = new Text('+5', { ...style, fontSize: 103 });
    numberText.anchor.set(0.5);
    numberText.y -= 40;
    const freeSpinsText = new Text(localize('free_spins').toUpperCase(), { ...style, fontSize: 64 });
    freeSpinsText.anchor.set(0.5);
    freeSpinsText.y = 40;

    this.plate.addChild(numberText, freeSpinsText);
  }

  public show(): GsapTween {
    return Gsap.to(this.plate, {
      duration: 1,
      alpha: 1,
      yoyo: true,
      repeat: 1,
    });
  }
}
