import { Assets, Graphics } from 'pixi.js';

import { ReelView } from './view/ReelView';
import { LayerManager } from '@base/game/sources/LayerManager';
import { SymbolIndex } from '@/components/reelset/sources/enums';
import { FSM } from '@base/fsm/sources/FSM';
import { HorizontalReel } from '@/components/reelset/sources/reels/HorizontalReel';
import { LogoCounter } from '@/components/background/sources/LogoCounter';
import { BackgroundType } from '@/components/background/sources/Background';
import { App } from '@/components/game/sources/App';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { Reelset as Base } from '@base/reelset/sources/view/Reelset';
import { SizeConfig } from '@/utils/SizeConfig';

export const HR_REELS_POSITIONS = [1, 2, 3, 4];
export const HR_REEL_INDEX = 7;

type CrashSymbolsData = {
  formattedResult: number[][],
  horizontalReelData: boolean[]
}

export class Reelset extends Base {
  protected horizontalReel: HorizontalReel;
  public logoMegawaysCounter: LogoCounter;
  public static state: BackgroundType = 'basic';

  constructor() {
    super();

    App.$instance.eventEmitter.on('set-new-state', (state: BackgroundType) => {
      Reelset.state = state;
    });
  }

  public async startSpin(): Promise<void> {
    this.logoMegawaysCounter.reset();
    this.setMask(true);

    this.horizontalReel.addRandomSymbol('left', true, true);

    await Promise.all([
      this.horizontalReel.startSpin(),
      ...this.reels.map((reel, reelIndex) => {
        reel.addRandomSymbol('bottom', true, true);

        return reel.startSpin(reelIndex * 0.1);
      }),
    ]);

    this.startSpinTime = performance.now();
  }

  public async stopSpin(symbolIndexes: SymbolIndex[][]): Promise<void> {
    this.logoMegawaysCounter.init(symbolIndexes);

    const difference = performance.now() - this.startSpinTime;
    const { reelSpinDuration, stopDelayBetweenReels } =
      FSM.$instance.currentState!.options.timings;
    const horizontalReelSymbolIndexes: SymbolIndex[] = [];

    this.reels.forEach((_, reelIndex) => {
      if (HR_REELS_POSITIONS.includes(reelIndex)) {
        horizontalReelSymbolIndexes.push(symbolIndexes[reelIndex].at(-1)!);
      }
    });

    this.horizontalReel.stopSpin(horizontalReelSymbolIndexes);

    await Promise.all(this.reels.map((reel, reelIndex) => reel.stopSpin(
      HR_REELS_POSITIONS.includes(reelIndex) ? symbolIndexes[reelIndex].slice(0, -1) : symbolIndexes[reelIndex],
      stopDelayBetweenReels * reelIndex,
      difference > reelSpinDuration * 1000 ? 0 : reelSpinDuration - difference / 1000,
    )));

    App.$instance.soundController.stop('reels_move');
  }

  protected createReels(): void {
    this.logoMegawaysCounter = new LogoCounter();

    const horizontalReelSymbolIndexes: SymbolIndex[] = [];

    const baseReelset = !RestoreManager.isRestoringCompleted
      ? RestoreManager.previousResult!.spin.avalanches[0].window
      : Assets.get('config').baseReelset;

    this.logoMegawaysCounter.init(baseReelset);
    this.logoMegawaysCounter.updateText(baseReelset.length - 1);

    for (let index = 0; index < this.columns; index++) {
      const symbolIndexes = baseReelset[index];

      if (HR_REELS_POSITIONS.includes(index)) {
        horizontalReelSymbolIndexes.push(symbolIndexes.at(-1));
      }

      const reel = new ReelView(index, HR_REELS_POSITIONS.includes(index) ? symbolIndexes.slice(0, -1) : symbolIndexes);
      this.reels.push(reel);
    }

    this.horizontalReel = new HorizontalReel(horizontalReelSymbolIndexes);
  }

  public setMask(value: boolean): void {
    if (value) {
      const maskConfig: {
        rect: [number, number, number, number],
        horizontalReelMask: [number, number, number, number]
      } = Assets.get('mask');
      const maskGraph = new Graphics().beginFill(0xffffff).drawRect(...maskConfig.rect);

      const horizontalMaskGraph = new Graphics().beginFill(0xffffff).drawRect(...maskConfig.horizontalReelMask);

      horizontalMaskGraph.position.x = SizeConfig.reelsWidth / 2;
      horizontalMaskGraph.pivot.x = horizontalMaskGraph.width / 2;

      LayerManager.layers.get(this.reelsLayer)!.mask = maskGraph;
      LayerManager.layers.get(this.reelsLayer)?.addChild(maskGraph);

      LayerManager.layers.get('topReels')!.mask = horizontalMaskGraph;
      LayerManager.layers.get('topReels')?.addChild(horizontalMaskGraph);
    } else {
      LayerManager.layers
        .get(this.reelsLayer)
        ?.removeChild(LayerManager.layers.get(this.reelsLayer)!.mask as Graphics)?.destroy?.({ children: true });
      LayerManager.layers.get(this.reelsLayer)!.mask = null;

      LayerManager.layers
        .get('topReels')
        ?.removeChild(LayerManager.layers.get('topReels')!.mask as Graphics)?.destroy?.({ children: true });
      LayerManager.layers.get('topReels')!.mask = null;
    }
  }

  public winAndCrash(symbolsData: CrashSymbolsData) {
    return Promise.all([
      this.horizontalReel.winAndCrash(symbolsData.horizontalReelData),
      ...symbolsData.formattedResult.map((data, reelIndex) => {
        return this.reels[reelIndex].winAndCrash(data);
      }),
    ]);
  }

  public win(symbolsData: CrashSymbolsData) {
    return Promise.all([
      this.horizontalReel.win(symbolsData.horizontalReelData),
      ...symbolsData.formattedResult.map((data, reelIndex) => {
        return this.reels[reelIndex].win(data);
      }),
    ]);
  }

  public cleanAfterCrash(symbolsData: CrashSymbolsData) {
    this.horizontalReel.cleanAfterCrash(symbolsData.horizontalReelData);
    symbolsData.formattedResult.forEach((data, reelIndex) => {
      this.reels[reelIndex].cleanAfterCrash(data);
    });
  }

  public async fillCrashedCells(window: SymbolIndex[][], symbolsData: CrashSymbolsData) {
    const newSymbols = symbolsData.formattedResult.map((item, reelIndex) => {
      const length = item.length;
      // todo: need to improve it
      return window[reelIndex].slice(-(length + (HR_REELS_POSITIONS.includes(reelIndex) ? 1 : 0)), HR_REELS_POSITIONS.includes(reelIndex) ? -1 : undefined);
    });

    let currentReelIndex = HR_REELS_POSITIONS.at(-1)!;
    const horizontalNewSymbols = symbolsData.horizontalReelData.filter(Boolean).reduce((acc) => {
      acc.unshift(window[currentReelIndex].at(-1)!);
      currentReelIndex--;

      return acc;
    }, [] as SymbolIndex[]);


    return Promise.all(
      [
        ...this.horizontalReel.addNewSymbols(HR_REELS_POSITIONS.map((index) => window[index].at(-1)!), horizontalNewSymbols),
        ...newSymbols.map((data, reelIndex) => {
          if (data.length) {
            return this.reels[reelIndex].addNewSymbols(window[reelIndex], data);
          }

          return null;
        }),
      ],
    );
  }
}
