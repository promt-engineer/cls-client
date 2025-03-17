import { State } from '@base/fsm/sources/State';
import { FsmState } from '@/components/fsm/sources/enums';
import { FreeSpinMenu } from '@/components/freespins/sources/FreeSpinMenu';
import { App } from '@/components/game/sources/App';
import { FSM } from '@base/fsm/sources/FSM';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { Assets } from 'pixi.js';
import { Timings } from '@/components/reelset/sources/types';
import { GlobalStore } from '@base/game/sources/global-store/GlobalStore';
import { UIController } from '@/components/ui/sources/UIController';
import UIState from '@base/ui/sources/UIState';
import Autoplay from '@base/ui/sources/settings/Autoplay';
import { sleep } from 'gh-client-base';
import { ServerAdapter } from '@base/network/sources/ServerAdapter';

export interface StateData {
  data: Network.IGameResults;
  avalanches?: Network.Avalanche[];
  currentSpin?: Network.BonusSpin;
}

export class FreeSpin extends State {
  protected readonly menu = new FreeSpinMenu();
  protected isActive = false;
  protected isFsCompleted = false;
  protected freeSpins: Network.BonusSpin[] = [];
  public readonly options = {
    timings: Assets.get<Timings>('timings').regularSpin,
  };

  constructor() {
    super(FsmState.FreeSpin);
  }

  async onEnter(data: StateData): Promise<StateData> {
    if (!this.isActive) {
      if (!data.data.spin.bonus && data.data.spin.bonus_choice) {
        this.isActive = true;
        Autoplay.isBlockShowingPopups = true;

        if (RestoreManager.isChooseBonusRestored) {
          GlobalStore.balance += data.data.spin.award;
        }

        App.$instance.eventEmitter.emit(
          'update-balance',
          GlobalStore.balance,
        );

        App.$instance.eventEmitter.emit('reset-win');

        this.menu.initFSChoices(data.data.spin.bonus_choice!);

        const [, bonusSpinData] = await Promise.all([
          this.menu.startFreeSpins(),
          new Promise<Network.IGameResults>((resolve) => {
            App.$instance.eventEmitter.once('get-bonus-spin-data', (data: Network.ISpinResult) => {
              resolve(data.game_results);
            });
          }),
        ]);

        return super.onEnter({ data: bonusSpinData });
      } else if (data.data.spin.bonus) {
        const freeGame = data.data.spin.bonus;

        const isFSRestoringCompleted =
          !RestoreManager.isRestoringCompleted &&
          RestoreManager.bonusSpinIndex === freeGame.spins.length;

        this.isActive = !isFSRestoringCompleted;

        Autoplay.isBlockShowingPopups = true;

        if (this.isActive) {
          UIState.enableSpin(true);
          App.$instance.eventEmitter.emit('update-fs-multiplier', freeGame.spins[RestoreManager.bonusSpinIndex].multiplier[0], true);
          // Wait 1 sec after restoring free spins
          await sleep(1000);
        }
      }
    }

    return super.onEnter(data);
  }

  async onProgress(data: StateData): Promise<any> {
    if (this.isActive) {
      if (!data?.currentSpin) {
        if (RestoreManager.isRestoringCompleted) {
          this.freeSpins = data.data.spin.bonus!.spins.slice(0);
        } else {
          this.freeSpins = data.data.spin.bonus!.spins.slice(RestoreManager.bonusSpinIndex);
          const accumulatedWin = data.data.spin.bonus!.spins.slice(0, RestoreManager.bonusSpinIndex).reduce((acc, item) => acc + item.award, 0);
          App.$instance.eventEmitter.emit('accumulate-win', accumulatedWin);
        }
      } else {
        await RestoreManager.saveFreeGamePoint();
      }

      if (this.freeSpins.length) {
        FSM.$instance.setAfter(FsmState.FreeSpin, FsmState.FSGame);

        const spin = this.freeSpins.shift()!;

        App.$instance.eventEmitter.emit('show-fs-left', true);

        App.$instance.eventEmitter.emit('update-fs-left', spin.bonus_spins_left - 1);

        UIState.slamStop.active = false;

        await App.$instance.game.reelset.startSpin();

        const { window } = spin.avalanches[0];
        await App.$instance.game.reelset.stopSpin(window);

        return { ...data, currentSpin: spin, avalanches: spin.avalanches };
      } else {
        this.isFsCompleted = true;
      }
    }

    return super.onProgress(data);
  }

  async onExit(data: StateData): Promise<any> {
    if (this.isActive && this.isFsCompleted) {
      const gameResults = data.data;
      this.isActive = false;

      await this.menu.startSummary(gameResults.spin.bonus!.award, gameResults.spin.bonus!.spins.length);

      if (!data.data.spin.buy_bonus && UIState.autospin.active) {
        Autoplay.checkSpecificModeWon();
      }

      this.isFsCompleted = false;
      Autoplay.isBlockShowingPopups = false;
    }

    if (!this.isActive) {
      let free_spins_ended_promise = Promise.resolve();

      const PFR = App.$instance.network.serverAdapter.PFR;

      if (PFR.isFreeSpinning) {
        PFR.updateWinnings(GlobalStore.win);
        PFR.checkFreeSpinsEnded();

        if (!PFR.isFreeSpinning) {
          free_spins_ended_promise = new Promise(resolve => {
            document.addEventListener(
              ServerAdapter.events.FREESPINS_COMPLETED_EVENT,
              () => {
                resolve();
              },
              {
                once: true,
              },
            );
          });
        }
      }
      await free_spins_ended_promise;

      Autoplay.checkDelayedPopup();

      if (RestoreManager.restoredFinalBalance) {
        GlobalStore.balance = RestoreManager.restoredFinalBalance;

        RestoreManager.restoredFinalBalance = 0;
      }

      App.$instance.eventEmitter.emit(
        'update-balance',
        GlobalStore.balance,
      );

      this.checkAutospin();

      if (!UIState.autospin.active) {
        UIController.emitter.emit('spin-end');
      }
    }

    return super.onExit(data);
  }

  private checkAutospin() {
    UIController.emitter.emit('current-spin-end');

    if (!UIState.autospin.active) return;

    if (UIState.spinNumber.value === 0) {
      UIController.emitter.emit('spin-end');
    } else {
      UIState.spinNumber.value -= 1;
      UIController.emitter.emit('update');
      FSM.$instance.setAfter('FreeSpin', 'Spin');
    }
  }
}
