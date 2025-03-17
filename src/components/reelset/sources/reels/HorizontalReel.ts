import { LayerManager } from '@base/game/sources/LayerManager';
import { Container } from 'pixi.js';
import { getRandomElement, Gsap, GsapTimeline, GsapTween } from 'gh-client-base';
import { SymbolIndex } from '@/components/reelset/sources/enums';
import { FSM } from '@base/fsm/sources/FSM';
import { SizeConfig } from '@/utils/SizeConfig';
import { BaseReel } from '@/components/reelset/sources/reels/BaseReel';
import { UIController } from '@/components/ui/sources/UIController';
import UIState from '@base/ui/sources/UIState';
import DummySymbol from '@/components/reelset/sources/view/DummySymbol';

export class HorizontalReel extends BaseReel {
  protected reelSize = 3;
  protected coef = 600;

  constructor(symbolIndexes: SymbolIndex[]) {
    super();

    this.buildReel(symbolIndexes);

    UIController.emitter.on('update', () => {
      this.coef = UIState.turbo.active ? 800 : 600;
    });
  }

  public tweenline: GsapTimeline;

  protected bounceBeforeSpin(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.globalTimeline.add(
        Gsap.to([...this.symbols, ...this.dummies], {
          x: `+=${SizeConfig.symbolWidth * 0.3}`,
          duration: 0.2,
          onComplete: () => {
            resolve();
          },
        }),
      );
    });
  }

  public async startSpin(): Promise<void> {
    await this.bounceBeforeSpin();

    this.tweenline = Gsap.timeline([]);

    this.addRandomSymbol('right', true);

    const spin = () => {
      this.tweenline.add(Gsap.to([...this.dummies, ...this.symbols], {
        x: `-=${SizeConfig.symbolWidth + SizeConfig.symbolIndentY}`,
        duration: 60 / this.coef,
        ease: 'none',
        onComplete: () => {
          this.addRandomSymbol('right');

          if (this.symbols.length) {
            this.removeRedundantFirstSymbol();
          }

          spin();
        },
      }));
    };

    spin();

    this.globalTimeline.add(this.tweenline);
  }

  protected symbolsToDestroy: Container[] = [];

  protected removeRedundantFirstSymbol(all = false): void {
    const firstSymbol = this.symbols[0];
    let isRemoved = false;

    if ((firstSymbol.x + SizeConfig.symbolWidth / 2 + SizeConfig.symbolIndentY) < 0) {
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
      return this.removeRedundantFirstSymbol(all);
    }
  }

  public addRandomSymbol(direction: 'left' | 'right', useSymbolsLength = false, asSymbol = false): void {
    const symbolIndexes = Object.values(SymbolIndex).filter(Number) as SymbolIndex[];
    const randomSymbolIndex = getRandomElement(symbolIndexes);

    if (asSymbol) {
      const symbol = this.createSymbol(randomSymbolIndex);
      symbol.buildSymbol(this.reelSize);
      symbol.setSymbolPosition(this.setSymbolX(direction, useSymbolsLength), SizeConfig.symbolHeight * 7 / (this.reelSize! + 1) / 2);

      this.reel.addChild(symbol.symbolContainer);

      if (direction === 'left') {
        this.symbols.unshift(symbol);
      } else {
        this.symbols.push(symbol);
      }
    } else {
      const symbol = new DummySymbol(true);
      symbol.position.set(this.setSymbolX(direction, useSymbolsLength) + SizeConfig.symbolWidth / 2, SizeConfig.symbolHeight * 7 / (this.reelSize! + 1) / 2);
      this.reel.addChild(symbol);

      if (direction === 'left') {
        this.dummies.unshift(symbol);
      } else {
        this.dummies.push(symbol);
      }
    }
  }

  public winAndCrash(symbols: boolean[]) {
    return Promise.all(symbols.map((_, symbolIndex) => this.symbols[symbolIndex].winAndCrash()));
  }

  public win(symbols: boolean[]) {
    return Promise.all(symbols.map((_, symbolIndex) => this.symbols[symbolIndex].win()));
  }

  public cleanAfterCrash(symbols: boolean[]) {
    let indexOffset = 0;
    symbols.forEach((_, symbolIndex) => {
      this.reel.removeChild(this.symbols[symbolIndex - indexOffset].symbolContainer);
      this.symbols.splice(symbolIndex - indexOffset, 1);
      indexOffset++;
    });
  }

  public addNewSymbols(symbolIndexes: SymbolIndex[], data: SymbolIndex[]) {
    for (let i = 0; i < data.length; i++) {
      const symbol = this.createSymbol(data[i]);
      symbol.buildSymbol(this.reelSize);
      symbol.setSymbolPosition(SizeConfig.symbolWidth * 4 + SizeConfig.symbolIndentX * 3 + i * (SizeConfig.symbolWidth + SizeConfig.symbolIndentX), SizeConfig.symbolHeight * 7 / (this.reelSize! + 1) / 2);

      this.reel.addChild(symbol.symbolContainer);
      this.symbols.push(symbol);
    }

    return symbolIndexes.map((_, symbolIndex) => {
      return Gsap.to(this.symbols[symbolIndex].symbolContainer, {
        duration: 0.5,
        x: symbolIndex * (SizeConfig.symbolIndentY + SizeConfig.symbolWidth) + SizeConfig.symbolWidth / 2,
      });
    });
  }


  public stopSpin(symbolIndexes: SymbolIndex[]): void {
    this.tweenline.kill();

    const indexes = [...symbolIndexes];

    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];

      const symbol = this.createSymbol(index);
      symbol.buildSymbol(this.reelSize);
      symbol.setSymbolPosition(this.setSymbolX('right', i !== 0), SizeConfig.symbolHeight * 7 / (this.reelSize! + 1) / 2);

      this.reel.addChild(symbol.symbolContainer);
      this.symbols.push(symbol);
    }

    const {
      horizontalStopSpinDown,
      horizontalStopSpinUp,
    } = FSM.$instance.currentState?.options.timings;

    this.globalTimeline.clear();

    const offset = UIState.isFastSpin ? 0 : SizeConfig.symbolWidth / 4;

    this.globalTimeline.add(this.bounceAfterSpin(horizontalStopSpinDown, offset));

    if (offset) {
      this.globalTimeline.add(
        Gsap.to(this.symbols, {
          duration: horizontalStopSpinUp,
          x: `+=${offset}`,
          onComplete: () => {
            this.symbolsToDestroy.forEach((item) => item.destroy({ children: true }));
            this.symbolsToDestroy.length = 0;

            this.globalTimeline.clear(true);

            this.globalTimeline = Gsap.timeline([]);
          },
        }),
        '>',
      );
    }
  }

  protected bounceAfterSpin(horizontalStopSpinDown: number, offset: number): GsapTween {
    return Gsap.to([...this.symbols, ...this.dummies], {
      x: `-=${
        Math.abs(this.symbols.at(-1)!.x + SizeConfig.symbolWidth / 2 - (SizeConfig.symbolWidth * 4 + SizeConfig.symbolIndentX * 3)) + offset
      }`,
      duration: horizontalStopSpinDown,
      onComplete: () => {
        this.removeRedundantFirstSymbol(true);

        this.dummies.forEach((item) => item.destroy({ children: true }));
        this.dummies.length = 0;

        if (!offset) {
          this.symbolsToDestroy.forEach((item) => item.destroy({ children: true }));
          this.symbolsToDestroy.length = 0;

          this.tweenline.getChildren().forEach((item: GsapTween | GsapTimeline) => item.kill());
          this.tweenline.clear(true);

          this.globalTimeline.getChildren(true, true, true).forEach((item: GsapTween | GsapTimeline) => item.kill());
          this.globalTimeline.clear(true);

          this.globalTimeline = Gsap.timeline([]);
        }
      },
    });
  }

  protected buildReel(symbolIndexes: SymbolIndex[]): void {
    this.reel = new Container();

    this.setReelPosition(SizeConfig.symbolWidthWithIndent, 0);
    this.buildSymbols(symbolIndexes);

    LayerManager.layers.get('topReels')?.addChild(this.reel);
  }

  protected setSymbolX(direction: 'left' | 'right', useSymbolsLength = false): number {
    if (useSymbolsLength) {
      if (this.symbols.length) {
        if (direction === 'left') {
          return this.symbols[0].x - (SizeConfig.symbolWidth * 1.5 + SizeConfig.symbolIndentX);
        } else {
          return this.symbols.at(-1)!.x + (SizeConfig.symbolWidth / 2 + SizeConfig.symbolIndentX);
        }
      } else {
        return 0;
      }
    }

    if (direction === 'left') {
      return this.dummies[0].x - (SizeConfig.symbolWidth * 1.5 + SizeConfig.symbolIndentX);
    } else {
      return this.dummies.at(-1)!.x + (SizeConfig.symbolWidth / 2 + SizeConfig.symbolIndentX);
    }
  }

  protected buildSymbols(symbolIndexes: SymbolIndex[]): void {
    symbolIndexes.forEach((index) => this.addSymbol(index, this.reelSize));
  }

  protected addSymbol(symbolIndex: SymbolIndex, reelSize: number): void {
    const symbol = this.createSymbol(symbolIndex);
    symbol.buildSymbol(reelSize);
    symbol.setSymbolPosition(this.setSymbolX('right', true), SizeConfig.symbolHeight * 7 / (reelSize! + 1) / 2);

    this.reel.addChild(symbol.symbolContainer);
    this.symbols.push(symbol);
  }
}
