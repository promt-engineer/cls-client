import { App } from '@/components/game/sources/App';
import { SpineAnimation } from 'gh-client-base';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { SymbolIndex } from '@/components/reelset/sources/enums';
import { LOW_SYMBOLS } from '@/components/reelset/sources/view/SymbolView';
import { SIZES } from '@/components/reelset/sources/view/ReelView';
import DummySymbol from '@/components/reelset/sources/view/DummySymbol';
import { BackgroundType } from '@/components/background/sources/Background';
import { AssetsPreloader as Base } from '@base/game/sources/assets-loader/AssetsPreloader';

export class AssetsPreloader extends Base {
  constructor() {
    super();
  }

  protected async afterPreload(res: any): Promise<void> {
    App.$instance.eventEmitter.on('set-new-state', (state: BackgroundType) => {
      DummySymbol.backgroundType = state;
    });

    await super.afterPreload(res);

    if (RestoreManager.isFreeSpinsRestored) {
      App.$instance.eventEmitter.emit('set-new-state', 'fs', false, true);
    }
  }

  protected generateSymbolTextures(): void {
    Object.values(SymbolIndex).filter((item): item is SymbolIndex => !!Number(item)).forEach((index, elementIndex) => {
      let spine: SpineAnimation;

      switch (index) {
        case SymbolIndex.s6:
        case SymbolIndex.s7:
        case SymbolIndex.s8:
        case SymbolIndex.s9:
        case SymbolIndex.s10: {
          spine = new SpineAnimation(`low_symbol`);
          spine.changeSkin(LOW_SYMBOLS[index]);

          break;
        }

        default: {
          spine = new SpineAnimation(`symbol_${index}`);
        }
      }

      spine.play(`win_3`).pause();

      const texture = App.$instance.renderer.generateTexture(spine);

      // it crops texture
      if (index === 5) {
        texture.frame.x = 9;
        texture.frame.y = 18;
        texture.frame.width *= 0.91;
        texture.frame.height *= 0.83;
        texture.updateUvs();
      }

      this.symbolTextures.set(index, texture);
    });
  }

  protected generateBlurredTextures(): void {
    (['basic', 'fs'] as BackgroundType[]).forEach((type) => {
      SIZES.forEach((size) => {
        Object.values(SymbolIndex).filter((item): item is SymbolIndex => !!Number(item)).forEach((index) => {
          let spine: SpineAnimation;

          switch (index) {
            case SymbolIndex.s6:
            case SymbolIndex.s7:
            case SymbolIndex.s8:
            case SymbolIndex.s9:
            case SymbolIndex.s10: {
              spine = new SpineAnimation(`low_symbol`);
              spine.changeSkin(LOW_SYMBOLS[index]);

              break;
            }

            default: {
              spine = new SpineAnimation(`symbol_${index}`);
            }
          }

          if (index === SymbolIndex.s11 && size !== 3) return;

          const prefix = type === 'basic' ? 'win' : 'gold';
          const animation = `${prefix}_${size}`;

          if (!spine.hasAnimation(animation)) return;

          spine.play(animation).pause();

          spine.filters = [this.blurFilter];

          const blurredTexture = App.$instance.renderer.generateTexture(spine);

          if (DummySymbol.blurredSymbolTextures[type].has(index)) {
            DummySymbol.blurredSymbolTextures[type].get(index)?.set(size, blurredTexture);
          } else {
            DummySymbol.blurredSymbolTextures[type].set(index, new Map());
            DummySymbol.blurredSymbolTextures[type].get(index)?.set(size, blurredTexture);
          }
        });
      });
    });
  }
}
