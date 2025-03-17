import { Assets, ITextStyle, Sprite, Text, Texture } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { Gsap, GsapTween, rescaleToWidth } from 'gh-client-base';
import { App } from '@/components/game/sources/App';
import { UIController } from '@/components/ui/sources/UIController';

const DURATION = 1.833 * 0.7 * 2;

export class ShowWin {
  protected plate = new Sprite(Texture.from('win-plate'));
  protected text: Text;

  constructor() {
    const { winNumber } = Assets.get<Record<string, ITextStyle>>('winTextStyles');

    this.text = new Text('', winNumber);
    this.text.anchor.set(0.5);
    this.plate.addChild(this.text);

    this.plate.anchor.set(0.5);
    this.plate.alpha = 0;
    LayerManager.layers.get('win-foreground')?.addChild(this.plate);

    UIController.emitter.on('slam-stop', () => {
      if (this.showTween?.isActive()) {
        this.showTween.timeScale(3);
      }
    });
  }

  protected showTween: GsapTween | null = null;

  public show(amount: number): Promise<void> {
    this.text.text = App.$instance.network.serverAdapter.formatCoins(amount);

    if (this.text.width > 360) {
      rescaleToWidth(this.text, 360);
    }

    return new Promise<void>((resolve) => {
      this.showTween = Gsap.to(this.plate, {
        keyframes: [
          {
            duration: DURATION * 0.2,
            alpha: 1,
          },
          {
            duration: DURATION * 0.6,
          },
          {
            duration: DURATION * 0.2,
            alpha: 0,
          },
        ],
        ease: 'none',
        onComplete: () => {
          this.showTween!.kill();

          resolve();
        },
      });
    })
  }
}
