import { LayerManager } from '@base/game/sources/LayerManager';
import { Container } from 'pixi.js';
import { getRandomElement, Gsap, GsapTimeline, GsapTween } from 'gh-client-base';
import { SymbolIndex } from '@/components/reelset/sources/enums';
import { FSM } from '@base/fsm/sources/FSM';
import { SizeConfig } from '@/utils/SizeConfig';
import { BaseReel } from '@/components/reelset/sources/reels/BaseReel';
import { HR_REELS_POSITIONS } from '@/components/reelset/sources/Reelset';
import { UIController } from '@/components/ui/sources/UIController';
import UIState from '@base/ui/sources/UIState';
import { App } from '@/components/game/sources/App';
import DummySymbol from '@/components/reelset/sources/view/DummySymbol';

export const SIZES = [1, 2, 3, 4, 5, 6];

const normalSpeed = 4000;
const turboSpeed = 5000;
let scatterLandingCounter = 0;

export class ReelView extends BaseReel {
  protected coef = normalSpeed;
  protected symbolsToDestroy: Container[] = [];

  constructor(reelIndex: number, symbolIndexes: SymbolIndex[]) {
    super(reelIndex);

    this.buildReel(symbolIndexes);

    UIController.emitter.on('update', () => {
      this.coef = UIState.turbo.active ? turboSpeed : normalSpeed;

      if (this.stopWaiter?.isActive?.() && UIState.isFastSpin) {
        this.stopWaiter.totalProgress(1);
      }
    });
  }

  public async startSpin(delay: number): Promise<void> {
    scatterLandingCounter = 0;
    await this.bounceBeforeSpin(delay);

    this.addRandomSymbol('up', true);

    const spin = () => {
      const distance = (SizeConfig.reelsHeight - SizeConfig.symbolIndentY * 6) / (6 + 1);

      this.globalTimeline.add(
        Gsap.to([...this.dummies, ...this.symbols], {
          y: `+=${distance}`,
          duration: distance / this.coef,
          ease: 'none',
          onComplete: () => {
            const elements = [...this.symbols, ...this.dummies];
            const firstSymbol = elements[0];

            if ((firstSymbol.y - firstSymbol.height / 2 - SizeConfig.symbolIndentY) > SizeConfig.reelsHeight) {
              if (firstSymbol instanceof DummySymbol) {
                const symbol = this.dummies.shift()!;
                symbol.regenerate();

                symbol.position.set(SizeConfig.symbolWidth / 2, this.setSymbolY('up', symbol.height));
                this.dummies.push(symbol);
              } else {
                const oldSymbol = this.symbols.shift()!;
                this.reel.removeChild(oldSymbol.symbolContainer);

                const symbol = new DummySymbol();
                symbol.position.set(SizeConfig.symbolWidth / 2, this.setSymbolY('up', symbol.height));

                oldSymbol.destroy();
                this.reel.addChild(symbol);
                this.dummies.push(symbol);
              }
            }

            // safe limit to avoid using while
            let counter = 3;

            for (let i = 0; i < counter; i++) {
              const lastSymbol = this.dummies.at(-1)!;

              if ((lastSymbol.y + lastSymbol.height / 2 + distance) > 0) {
                const symbol = new DummySymbol();
                symbol.position.set(SizeConfig.symbolWidth / 2, this.setSymbolY('up', symbol.height));

                this.reel.addChild(symbol);
                this.dummies.push(symbol);
              } else {
                break;
              }
            }

            spin();
          },
        }),
      );
    };

    spin();
  }

  protected bounceBeforeSpin(delay: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.globalTimeline.add(
        Gsap.to([...this.symbols, ...this.dummies], {
          y: `-=${SizeConfig.symbolHeight * 0.3}`,
          duration: 0.2,
          delay: UIState.isFastSpin ? 0 : delay,
          onComplete: () => {
            if (this.reelIndex === 0) {
              App.$instance.soundController.play('reels_move');
            }

            resolve();
          },
        }),
      );
    });
  }

  public async winAndCrash(symbols: number[]) {
    return Promise.all(symbols.map((symbolIndex) => this.symbols[symbolIndex].winAndCrash()));
  }

  public async win(symbols: number[]) {
    return Promise.all(symbols.map((symbolIndex) => this.symbols[symbolIndex].win()));
  }

  public addNewSymbols(symbolIndexes: SymbolIndex[], data: SymbolIndex[]) {
    const size = [...this.symbols, ...data].length - 1;

    for (let i = 0; i < data.length; i++) {
      const symbol = this.createSymbol(data[i]);
      symbol.buildSymbol(size);
      symbol.setSymbolPosition(0, -(symbol.height / 2 + SizeConfig.symbolIndentY + i * symbol.height));

      this.reel.addChild(symbol.symbolContainer);
      this.symbols.push(symbol);
    }

    return symbolIndexes.slice(HR_REELS_POSITIONS.includes(this.reelIndex) ? 1 : 0).map((_, symbolIndex) => {
      return Gsap.to(this.symbols[symbolIndex].symbolContainer, {
        duration: 0.5,
        y: (SizeConfig.reelsHeight - this.symbols[symbolIndex].height / 2) - symbolIndex * (this.symbols[symbolIndex].height + SizeConfig.symbolIndentY),
        onStart: () => {
          App.$instance.soundController.play('tiles_drop');
        },
      });
    });
  }

  public cleanAfterCrash(symbols: number[]) {
    let indexOffset = 0;
    symbols.forEach((symbolIndex) => {
      this.symbols[symbolIndex - indexOffset].destroy();
      this.reel.removeChild(this.symbols[symbolIndex - indexOffset].symbolContainer).destroy({ children: true });
      this.symbols.splice(symbolIndex - indexOffset, 1);
      indexOffset++;
    });
  }

  protected removeRedundantSymbols(all = false): void {
    const firstSymbol = this.symbols[0];
    let isRemoved = false;

    if ((firstSymbol.y - firstSymbol.height / 2 - SizeConfig.symbolIndentY) > SizeConfig.reelsHeight) {
      const oldSymbol = this.symbols.shift()!;
      this.reel.removeChild(oldSymbol.symbolContainer);

      oldSymbol.destroy();
      if (all) {
        this.symbolsToDestroy.push(oldSymbol.symbolContainer);
      } else {
        oldSymbol.symbolContainer.destroy({ children: true });
      }

      isRemoved = true;
    }

    if (all && isRemoved) {
      return this.removeRedundantSymbols(all);
    }
  }

  public addRandomSymbol(direction: 'up' | 'bottom', useSymbolsLength = false, asSymbol = false): void {
    const symbolIndexes = Object.values(SymbolIndex).filter((item): item is SymbolIndex => typeof item === 'number' && item !== SymbolIndex.s11);
    const randomSymbolIndex = getRandomElement(symbolIndexes);
    const randomSize = getRandomElement(SIZES);

    if (asSymbol) {
      const symbol = this.createSymbol(randomSymbolIndex);
      symbol.buildSymbol(randomSize);
      symbol.setSymbolPosition(0, this.setSymbolY(direction, symbol.height, useSymbolsLength));
      this.reel.addChild(symbol.symbolContainer);

      if (direction === 'bottom') {
        this.symbols.unshift(symbol);
      } else {
        this.symbols.push(symbol);
      }
    } else {
      const symbol = new DummySymbol();
      symbol.position.set(SizeConfig.symbolWidth / 2, this.setSymbolY(direction, symbol.height, useSymbolsLength));
      this.reel.addChild(symbol);

      if (direction === 'bottom') {
        this.dummies.unshift(symbol);
      } else {
        this.dummies.push(symbol);
      }
    }
  }

  public stopSpin(symbolIndexes: SymbolIndex[], duration: number, delay: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.stopWaiter = Gsap.to({}, {
        delay: UIState.isFastSpin ? 0 : delay,
        duration: UIState.isFastSpin ? 0.2 : duration,
        onUpdate(this: GsapTween) {
          if (UIState.isFastSpin && this.totalProgress() !== 1) {
            this.totalProgress(1);
          }
        },
        onComplete: () => {
          this.stopWaiter = null;
          this.globalTimeline.clear();

          for (let i = 0; i < symbolIndexes.length; i++) {
            const index = symbolIndexes[i];

            const symbol = this.createSymbol(index);
            symbol.buildSymbol(symbolIndexes.length - 1);
            symbol.setSymbolPosition(0, this.setSymbolY('up', symbol.height, i !== 0));

            this.reel.addChild(symbol.symbolContainer);
            this.symbols.push(symbol);
            if (symbolIndexes[i] === 12) {
              switch(scatterLandingCounter) {
                case 0:
                  App.$instance.soundController.play('scatter_landing_1');
                  scatterLandingCounter++;
                  break;
                case 1:
                  App.$instance.soundController.play('scatter_landing_2');
                  scatterLandingCounter++;
                  break;
                case 2:
                  App.$instance.soundController.play('scatter_landing_3');
                  break;
              }
            }
          }

          this.globalTimeline.add(this.bounceAfterSpin(resolve));
        },
      });
    });
  }

  protected bounceAfterSpin(complete: () => void): GsapTween {
    const { stopSpinDown, stopSpinUp } = FSM.$instance.currentState?.options.timings;

    return Gsap.to([...this.symbols, ...this.dummies], {
      keyframes: [
        {
          y: `+=${
            Math.abs(this.symbols.at(-1)!.y - this.symbols.at(-1)!.height / 2) + SizeConfig.symbolHeight / 4
          }`,
          duration: stopSpinDown,
          onComplete: () => {
            App.$instance.soundController.play('reels_stop');
          },
        },
        {
          duration: stopSpinUp,
          y: `-=${SizeConfig.symbolHeight / 4}`,
        },
      ],
      onComplete: () => {
        this.removeRedundantSymbols(true);

        this.dummies.forEach((item) => item.destroy({ children: true }));
        this.dummies.length = 0;

        App.$instance.game.reelset.logoMegawaysCounter.updateText(this.reelIndex);

        this.symbolsToDestroy.forEach((item) => item.destroy({ children: true }));
        this.symbolsToDestroy.length = 0;

        this.globalTimeline.getChildren(true, true, true).forEach((item: GsapTween | GsapTimeline) => item.kill());
        this.globalTimeline.clear(true);

        this.globalTimeline = Gsap.timeline([]);
        complete();
      },
    });
  }

  protected buildReel(symbolIndexes: SymbolIndex[]): void {
    this.reel = new Container();

    this.setReelPosition(this.reelIndex * SizeConfig.symbolWidthWithIndent, 0);
    this.buildSymbols(symbolIndexes);

    LayerManager.layers.get('reels')?.addChild(this.reel);
  }

  protected setSymbolY(direction: 'up' | 'bottom', symbolHeight: number, useSymbolsLength = false): number {
    if (useSymbolsLength) {
      if (this.symbols.length) {
        if (direction === 'up') {
          return this.symbols.at(-1)!.y - (this.symbols.at(-1)!.height / 2 + symbolHeight / 2 + SizeConfig.symbolIndentY);
        } else {
          return this.symbols[0].y + (this.symbols[0].height / 2 + symbolHeight / 2 + SizeConfig.symbolIndentY);
        }
      } else {
        return SizeConfig.reelsHeight - symbolHeight / 2;
      }
    }

    if (direction === 'up') {
      return this.dummies.at(-1)!.y - (this.dummies.at(-1)!.height / 2 + symbolHeight / 2 + SizeConfig.symbolIndentY);
    } else {
      return this.dummies[0].y + (this.dummies[0].height / 2 + symbolHeight / 2 + SizeConfig.symbolIndentY);
    }
  }

  protected buildSymbols(symbolIndexes: SymbolIndex[]): void {
    symbolIndexes.forEach((index) => this.addSymbol(index, symbolIndexes.length - 1));
  }

  protected addSymbol(symbolIndex: SymbolIndex, reelSize: number): void {
    const symbol = this.createSymbol(symbolIndex);
    symbol.buildSymbol(reelSize);
    symbol.setSymbolPosition(0, this.setSymbolY('up', symbol.height, true));

    this.reel.addChild(symbol.symbolContainer);
    this.symbols.push(symbol);
  }
}
