import { Sprite, Texture } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { App } from '@/components/game/sources/App';
import { SizeConfig } from '@/utils/SizeConfig';

export class Logo extends Sprite {
  constructor() {
    super(Texture.from('logo'));

    this.anchor.set(0.5);
    this.position.set(-555, -340);

    LayerManager.layers.get('reelset')?.addChild(this);

    App.$instance.eventEmitter.on('resize', () => {
      this.onResize();
    });
    this.onResize();
  }

  protected onResize(): void {
    if (!SizeConfig.isLandscape) {
      this.scale.set(0.95);
    } else {
      this.scale.set(1);
    }
  }
}
