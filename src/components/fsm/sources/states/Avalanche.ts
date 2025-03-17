import { State } from '@base/fsm/sources/State';
import { FsmState } from '@/components/fsm/sources/enums';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { App } from '@/components/game/sources/App';
import { SymbolIndex } from '@/components/reelset/sources/enums';
import { HR_REELS_POSITIONS } from '@/components/reelset/sources/Reelset';
import { StateData } from '@/components/fsm/sources/states/FreeSpin';
import { Assets } from 'pixi.js';
import UIState from '@base/ui/sources/UIState';
import Autoplay from '@base/ui/sources/settings/Autoplay';
import { GlobalStore } from '@base/game/sources/global-store/GlobalStore';
import { AdditionalFreeSpinsPopup } from '@/components/freespins/sources/AdditionalFreeSpinsPopup';
import { Gamble } from '@base/gamble/sources/Gamble';
import { waitForEvent } from 'gh-client-base';

function getUniqueSymbolPositions(window: SymbolIndex[][], payItems: Network.PayItem[]) {
  const preResult = new Map<number, Set<number>>();

  payItems.forEach((item) => {
    item.indexes.forEach((symbolPosition, reelIndex) => {
      if (!symbolPosition) return;

      if (!preResult.has(reelIndex)) {
        preResult.set(reelIndex, new Set<number>());
      }

      preResult.get(reelIndex)!.add(symbolPosition[0]);
    });
  });


  const formattedResult = [...preResult.entries()].reduce((acc, [key, uniqIndexes]) => {
    acc[key] = [...uniqIndexes.values()].sort();

    return acc;
  }, [] as number[][]);

  const horizontalReelData: boolean[] = [];

  formattedResult.forEach((item, reelIndex) => {
    if (HR_REELS_POSITIONS.includes(reelIndex) && (item.at(-1)! + 1) === window[reelIndex].length) {
      horizontalReelData[reelIndex - 1] = true;
      item.pop();
    }
  });

  return { formattedResult, horizontalReelData };
}

export class Avalanche extends State {
  protected isBonusGame = false;
  protected isFreeSpinGame = false;
  protected restoreFreeSpins = false;
  protected additionalFSPopup = new AdditionalFreeSpinsPopup();
  protected gamble: Gamble;
  

  constructor() {
    super(FsmState.Avalanche);
    
  }

  async onEnter(data: StateData): Promise<any> {
    if (data.data.spin.bonus) {
      this.isFreeSpinGame = true;

      if (data.currentSpin?.bonus_spins_triggered) {
        this.isBonusGame = true;
      }
    } else if (data.data.spin.bonus_choice) {
      this.isBonusGame = true;
    }

    if (!RestoreManager.isRestoringCompleted) {
      UIState.enableSpin(true);
    }

    if (!RestoreManager.isRestoringCompleted && this.isFreeSpinGame && !this.restoreFreeSpins) {
      this.restoreFreeSpins = true;

      return data;
    }

    if (!RestoreManager.isRestoringCompleted && !this.isFreeSpinGame) {
      App.$instance.game.reelset.setMask(true);
    }

    const avalanches = data.avalanches!;

    if (avalanches[0].pay_items?.length) {
      for (let i = 0; i < avalanches.length; i++) {
        const isLastBonusAvalancheItem = this.isBonusGame && i === avalanches.length - 1;

        const { pay_items, window } = avalanches[i];

        if (pay_items?.length) {
          const symbolsData = getUniqueSymbolPositions(window, pay_items);
          const avalancheAward = this.isFreeSpinGame
            ? pay_items.reduce((acc, item) => acc + (item?.award_with_multiplier ?? 0), 0)
            : pay_items.reduce((acc, item) => acc + item.award, 0);

          if (avalancheAward / data.data.spin.wager >= Assets.get<Win.WinConfig>('winConfig').winBaseRatio) {
            await App.$instance.game.bigWin.playWin(avalancheAward, data.data.spin.wager);
          }

          if (!isLastBonusAvalancheItem) {
            if (this.isFreeSpinGame) {
              App.$instance.eventEmitter.emit('play-win-fs-multiplier');
            }

            const promise = App.$instance.game.showWin.show(avalancheAward);
            await App.$instance.game.reelset.winAndCrash(symbolsData);
            App.$instance.eventEmitter.emit('accumulate-win', avalancheAward);

            App.$instance.game.reelset.cleanAfterCrash(symbolsData);

            if (this.isFreeSpinGame) {
              await promise;
              await new Promise<void>((resolve) => {
                App.$instance.eventEmitter.emit('update-fs-multiplier', data.currentSpin?.multiplier[i + 1], false, resolve);
              });
            }

            await App.$instance.game.reelset.fillCrashedCells(avalanches[i + 1].window, symbolsData);
          } else {

            App.$instance.soundController.play('scatter');
            await Promise.all([
              this.isFreeSpinGame ? this.additionalFSPopup.show() : Promise.resolve(),
              await App.$instance.game.reelset.win(symbolsData),
            ]);
          }
        }
      }

      if (UIState.autospin.active) {
        Autoplay.checkWinConditions(GlobalStore.win);
      }
    }

    if (UIState.autospin.active) {
      Autoplay.checkWinConditions();
    }

    return super.onEnter(data);
  }

  async onExit(data?: any): Promise<any> {
    App.$instance.game.reelset.setMask(false);

    if (!this.isFreeSpinGame) {
      await RestoreManager.completeSpin();

      this.restoreFreeSpins = false;
    }

    this.isFreeSpinGame = false;
    this.isBonusGame = false;

    if (data.data.can_gamble && (!UIState.autospin.active || UIState.spinNumber.value === 0)) {
      this.gamble = new Gamble()
      this.gamble.enableButtonsOnGamble();
      // await waitForEvent('gamble-game');
    }

    return super.onExit(data);
  }
}
