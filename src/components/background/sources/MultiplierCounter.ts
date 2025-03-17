import { Assets, Sprite, Text, Texture } from 'pixi.js';
import { App } from '@/components/game/sources/App';
import { Gsap, GsapTimeline, localize, rescaleToWidth } from 'gh-client-base';
import { LayerManager } from '@base/game/sources/LayerManager';
import { UIController } from '@/components/ui/sources/UIController';

export class MultiplierCounter extends Sprite {
  protected readonly counter: Text;
  protected counterStyle = Assets.get('counterFontStyles').counter;

  public value = 1;

  constructor() {
    super(Texture.from(`Multiplier_counter_plate`));

    this.counter = new Text('', this.counterStyle);
    const multiplier = new Text(localize('multiplier').toUpperCase(), {
      ...this.counterStyle,
      fontSize: 36,
    });
    multiplier.anchor.set(0.5, 0.5);
    rescaleToWidth(multiplier, 200)
    this.counter.anchor.set(0.5, 0.5);

    multiplier.y = -30;
    this.counter.y = 25;

    this.addChild(multiplier, this.counter);

    App.$instance.eventEmitter.on('update-fs-multiplier', (value: number, init?: boolean, callback?: () => void) => {
      this.updateText(value, !init, callback);
    });
    App.$instance.eventEmitter.on('play-win-fs-multiplier', () => {
      this.playWin();
    });

    UIController.emitter.on('slam-stop', () => {
      if (this.setNewMultiplierTimeline) {
        this.setNewMultiplierTimeline.timeScale(2);
        App.$instance.soundController.speedUp('multiplicator', 2);
      }
    });
  }

  protected playWin(): void {
    Gsap.to(this.counter, {
      keyframes: [
        {
          duration: 1 / 3,
          ease: 'none',
          pixi: {
            scale: 0.9,
          },
        },
        {
          duration: 1.1667 - 1 / 3,
          ease: 'none',
          pixi: {
            scale: 1.1,
          },
        },
        {
          duration: 1.5 - 1.1667,
          ease: 'none',
          pixi: {
            scale: 1,
          },
        },
      ],
    });
  }

  protected setNewMultiplierTimeline: GsapTimeline | null = null;

  protected updateText(value: number, withAnimation: boolean, callback?: () => void) {
    if (withAnimation) {
      const newCounter = new Text(`${value} X`, {
        ...this.counterStyle,
        strokeThickness: 4,
        fontSize: 800,
      });
      newCounter.anchor.set(0.5);
      LayerManager.layers.get('foreground')?.addChild(newCounter);

      App.$instance.soundController.speedUp('multiplicator', 1);
      App.$instance.soundController.play('multiplicator');

      this.setNewMultiplierTimeline = Gsap.timeline([
        {
          child: Gsap.to(newCounter.style, {
            fontSize: 200,
            duration: 1,
            ease: 'bounce.out',
          }),
        },
        {
          child: Gsap.to(newCounter, {
            delay: 0.4,
            x: -555,
            y: -335 + 25,
            ease: 'none',
          }),
        },
        {
          child: Gsap.to(newCounter, {
            alpha: 0,
            ease: 'power4.in',
            onComplete: () => {
              this.counter.text = `${value} X`;
              LayerManager.layers.get('foreground')!.removeChild(newCounter).destroy({ children: true });
            },
          }),
          position: '<',
        },
        {
          child: Gsap.to(newCounter.style, {
            fontSize: 100,
            ease: 'none',
          }),
          position: '<',
        },
        {
          child: Gsap.to({}, {
            duration: 0.2,
            onComplete: () => {
              callback?.();
            },
          }),
        },
      ], {
        onComplete: () => {
          this.setNewMultiplierTimeline = null;
        },
      });
    } else {
      this.counter.text = `${value} X`;
    }
  }
}
