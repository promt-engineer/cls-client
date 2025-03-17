import { App } from '@/components/game/sources/App';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { BuyBonus } from '@/components/bonus/sources/BuyBonus';
import { GlobalStore } from '@base/game/sources/global-store/GlobalStore';
import UIState from '@base/ui/sources/UIState';
import { DoubleChance } from '@/components/double-chance/sources/DoubleChance';
import { setLanguage } from '@/utils/Linguist';
import { Network as Base } from '@base/network/sources/Network';

export class Network extends Base {
  constructor() {
    super();
  }

  public async init(): Promise<void> {
    this.state = await this.serverAdapter.init(this.networkConfig.gameName);

    await setLanguage(this.serverAdapter.lang);

    RestoreManager.init(this.serverAdapter, this.state.session_token);

    let balance = this.state.balance;

    if (this.state.game_results) {
      RestoreManager.restore(this.state.game_results);
      this.bet = this.state.game_results.spin.buy_bonus
        ? this.state.game_results?.spin.wager / BuyBonus.coef
        : this.state.game_results?.spin.wager;

      if (!RestoreManager.isRestoringCompleted) {
        balance = RestoreManager.isFreeSpinsRestored
          ? this.state.balance - this.state.game_results!.spin.bonus!.award
          : this.state.balance - this.state.game_results.spin.award;
      }

      if(!this.state.game_results.restoring_indexes.base_spin_index){
        RestoreManager.completeSpin();
      }
    }

    GlobalStore.balance = balance;

    RestoreManager.updateMoneyParams(balance, this.bet, this.state.balance);
  }

  public async makeSpin(): Promise<Network.ISpinResult> {
    App.$instance.eventEmitter.emit('reset-win');

    let free_spin: string | undefined;

    if (this.serverAdapter.PFR.isFreeSpinning) {
      free_spin = this.serverAdapter.PFR.freeSpinId;
    }

    const body: Network.WagerBody = {
      currency: this.state.currency,
      session_token: this.state.session_token,
      wager: this.bet,
      freespin_id: free_spin,
      engine_params: {
        ante_bet: UIState.doubleChance.active,
      },
    };

    const result = await this.serverAdapter.makeSpin(body);

    if (result) {
      if (!this.serverAdapter.PFR.isFreeSpinning) {
        App.$instance.eventEmitter.emit(
          'update-balance',
          GlobalStore.balance - this.bet * (UIState.doubleChance.active ? DoubleChance.coef : 1),
        );
      }

      GlobalStore.balance = result.balance;
    }

    return result;
  }

  async gambleWin(pick: Network.IGamblePick, mode: Network.IGambleModes): Promise<Network.ISpinResult> {
    const body: Network.GambleBody = {
      session_token: this.state.session_token,
      engine_params: {
          [mode]: pick === "r" ? 1 : 0,
      },
  }
    return this.serverAdapter.gambleWin(body);
  }

  async sendBuyBonus(): Promise<Network.ISpinResult> {
    App.$instance.eventEmitter.emit('reset-win');

    const body: Network.BuyBonusBody = {
      wager: this.bet,
      engine_params: {
        buy_bonus: true,
      },
      session_token: this.state.session_token,
    };

    const result = await this.serverAdapter.sendBuyBonus(body);

    if (result) {
      App.$instance.eventEmitter.emit(
        'update-balance',
        GlobalStore.balance - BuyBonus.amount,
      );

      GlobalStore.balance = result.balance;
    }

    return result;
  }

  async generateBonus(bonusChoice: Network.BonusChoice): Promise<Network.ISpinResult> {
    const body: Network.GenerateBonusBody = {
      session_token: this.state.session_token,
      engine_params: bonusChoice,
    };

    const result = await this.serverAdapter.generateBonus(body);

    GlobalStore.balance = result.balance;

    return result;
  }

  public async sendCheat(cheat: string, anyNumber: number[] = []): Promise<Network.ISpinResult> {
    const cheats: Record<string, number[]> = {
      freeGame: [30, 6, 4, 84, 2, 22, 80],
      rareFreeGame: [
        26,
        1,
        10,
        57,
        51,
        25,
        86,
      ],
      bigWin: [25, 20, 38, 74, 16, 7, 34],
      gambleBlack: [24, 19, 33, 75, 16, 7, 33],
      gambleRed: [24, 19, 33, 75, 16, 7, 33]
    };
    const cheatDate = anyNumber.length ? anyNumber : cheats[cheat];
    const body: Network.CheatBody = {
      payload: {
        stops: cheatDate,
      },
      session_token: this.state.session_token,
    };
    if (cheat === "gambleBlack" || cheat === "gambleRed") {
      cheat =="gambleBlack" ? body.payload.gamble_pick = 0 : body.payload.gamble_pick = 1;
    }

    return this.serverAdapter.sendCheat(body);
  }
}
