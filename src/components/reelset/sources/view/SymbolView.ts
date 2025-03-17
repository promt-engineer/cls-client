import { SymbolIndex } from '@/components/reelset/sources/enums';
import { SpineAnimation } from 'gh-client-base';
import { SizeConfig } from '@/utils/SizeConfig';
import { App } from '@/components/game/sources/App';
import { BackgroundType } from '@/components/background/sources/Background';
import { Reelset } from '@/components/reelset/sources/Reelset';
import { SymbolView as Base } from '@base/reelset/sources/view/SymbolView';
import { UIController } from '@/components/ui/sources/UIController';

export const LOW_SYMBOLS = {
  [SymbolIndex.s6]: 'a',
  [SymbolIndex.s7]: 'k',
  [SymbolIndex.s8]: 'q',
  [SymbolIndex.s9]: 'j',
  [SymbolIndex.s10]: '10',
};

export class SymbolView extends Base {
  protected symbolSize: number;
  protected activeCrash = false;
  protected crashAnimation: SpineAnimation | null = null;

  constructor(symbolIndex: SymbolIndex) {
    super(symbolIndex);

    App.$instance.eventEmitter.on('set-new-state', this.onSetNewState, this);
  }

  protected onSlamStop(): void {
    if (this.crashAnimation) {
      this.symbolAnimation.alpha = 0;
      this.crashAnimation.state.timeScale = 3;
      App.$instance.soundController.speedUp('match', 3);

      if (!this.activeCrash) {
        this.activeCrash = true;

        this.onceEvent();
      }
    }
  }

  protected onSetNewState(state: BackgroundType): void {
    this.cache(false);

    requestAnimationFrame(() => {
      this.setDefaultAnimation(state);
    });
  }

  public get size(): number {
    return this.symbolSize;
  }

  public get height(): number {
    return (SizeConfig.reelsHeight - SizeConfig.symbolIndentY * this.size) / (this.size + 1);
  }

  public buildSymbol(size: number): void {
    this.symbolSize = size;

    this.createAnimation();

    if (this.symbolIndex === 1 || this.symbolIndex === 4) {
      this.symbolAnimation.scale.set(0.5);
    }

    this.symbolContainer.removeChildren().forEach((el) => el.destroy({ children: true }));
    this.cache();

    this.symbolContainer.addChild(this.symbolAnimation);
  }

  protected createAnimation(): void {
    switch (this.symbolIndex) {
      case SymbolIndex.s6:
      case SymbolIndex.s7:
      case SymbolIndex.s8:
      case SymbolIndex.s9:
      case SymbolIndex.s10: {
        this.symbolAnimation = new SpineAnimation(`low_symbol`);
        this.symbolAnimation.changeSkin(LOW_SYMBOLS[this.symbolIndex]);

        break;
      }

      default: {
        this.symbolAnimation = new SpineAnimation(`symbol_${this.symbolIndex}`);
      }
    }

    this.setDefaultAnimation(Reelset.state);
  }

  public destroy(): void {
    UIController.emitter.removeListener('slam-stop', this.onSlamStop, this);
    App.$instance.eventEmitter.removeListener('set-new-state', this.onSetNewState, this);
  }

  protected setDefaultAnimation(state: BackgroundType) {
    const prefix = state === 'basic' ? 'win' : 'gold';
    const animation = `${prefix}_${this.size}`;

    if (this.symbolAnimation.hasAnimation(animation)) {
      this.symbolAnimation.play(animation).pause();
    } else {
      this.symbolAnimation.play(`win_${this.size}`).pause();
    }
  }

  protected onceEvent() {
    this.crashAnimation!.scale.set(0.5);

    const prefix = Reelset.state === 'basic' ? 's' : 'gold';

    this.crashAnimation!.play(`${prefix}_${this.size}`);
    this.crashAnimation!.alpha = 1;
  }

  public async winAndCrash() {
    return new Promise<void>((resolve) => {
      this.crashAnimation = new SpineAnimation(`crash`);
      this.crashAnimation.alpha = 0;
      this.symbolContainer.addChildAt(this.crashAnimation, 0);

      this.cache(false);

      requestAnimationFrame(() => {
        App.$instance.soundController.speedUp('match', 1);

        App.$instance.soundController.play('match');
        this.symbolAnimation.resume();
        this.crashAnimation!.scale.set(0.5);
        this.symbolAnimation.once('event', () => {
          if (!this.activeCrash) {
            this.activeCrash = true;

            this.onceEvent();
          }
        });
        this.crashAnimation!.once('complete', () => {
          this.crashAnimation = null;

          resolve();
        });
      });
    });
  }

  public async win() {
    return new Promise<void>((resolve) => {
      this.cache(false);

      requestAnimationFrame(() => {
        this.symbolAnimation.resume();

        this.symbolAnimation.once('event', () => {
          this.symbolAnimation.pause();
          resolve();
        });
      });
    });
  }
}
