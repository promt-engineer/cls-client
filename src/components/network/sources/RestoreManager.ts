import { App } from '@/components/game/sources/App';
import { ServerAdapter } from '@base/network/sources/ServerAdapter';

export class RestoreManager {
  private static serverAdapter: ServerAdapter;
  private static sessionToken: string;
  private static currentIndexes = {
    base_spin_index: 0,
    bonus_spin_index: 0,
    gamble_collected: false
  };
  public static previousResult: Network.IGameResults | null = null;

  public static init(serverAdapter: ServerAdapter, sessionToken: string): void {
    RestoreManager.serverAdapter = serverAdapter;
    RestoreManager.sessionToken = sessionToken;
  }

  public static get bonusSpinIndex(): number {
    return RestoreManager.currentIndexes.bonus_spin_index;
  }

  public static restoredFinalBalance = 0;

  public static get isFreeSpinsRestored(): boolean {
    return (
      !RestoreManager.isRestoringCompleted && Boolean(RestoreManager.previousResult!.spin.bonus)
    );
  }

  public static get isRestoredGameWithAnteBet(): boolean {
    return RestoreManager.previousResult?.spin?.ante_bet ?? false;
  }

  public static get isChooseBonusRestored(): boolean {
    return (
      !RestoreManager.isRestoringCompleted &&
      Boolean(
        RestoreManager.previousResult!.spin.bonus_choice &&
          !RestoreManager.previousResult!.spin.bonus,
      )
    );
  }

  public static get isRestoringCompleted(): boolean {
    if (!RestoreManager.previousResult) {
      return true;
    }

    if (RestoreManager.previousResult.spin.bonus) {
      return (
        RestoreManager.currentIndexes.base_spin_index === 1 &&
        RestoreManager.currentIndexes.bonus_spin_index ===
          RestoreManager.previousResult.spin.bonus.spins.length
      );
    }

    if (
      RestoreManager.previousResult.spin.bonus_choice &&
      !RestoreManager.previousResult.spin.bonus
    ) {
      return false;
    }

    return RestoreManager.currentIndexes.base_spin_index === 1;
  }

  public static async restore(gameResults: Network.IGameResults) {
    RestoreManager.currentIndexes.base_spin_index = gameResults.restoring_indexes.base_spin_index;
    RestoreManager.currentIndexes.bonus_spin_index = gameResults.restoring_indexes.bonus_spin_index;

    RestoreManager.previousResult = {
      ...gameResults,
    };
  }

  public static updateMoneyParams(balance: number, bet: number, finalBalance: number): void {
    RestoreManager.restoredFinalBalance = finalBalance;
    App.$instance.eventEmitter.emit('update-balance', balance);

    App.$instance.eventEmitter.emit('update-bet', RestoreManager.serverAdapter.formatCoins(bet));
  }

  public static updateSpinIndexes(gamble_collected: boolean = false): Promise<any> {
    RestoreManager.currentIndexes.gamble_collected = gamble_collected;
    const body = JSON.stringify({
      restoring_indexes: RestoreManager.currentIndexes,
      session_token: RestoreManager.sessionToken,
    });

    return RestoreManager.serverAdapter.updateSpinsIndexes(body);
  }

  public static saveFreeGamePoint(): Promise<any> {
    RestoreManager.currentIndexes.bonus_spin_index++;

    return RestoreManager.updateSpinIndexes();
  }

  public static completeSpin(): Promise<any> {
    RestoreManager.currentIndexes.base_spin_index = 1;

    if (RestoreManager.previousResult && RestoreManager.isRestoringCompleted) {
      RestoreManager.previousResult = null;
    }

    return RestoreManager.updateSpinIndexes();
  }

  public static reset(): void {
    if (RestoreManager.previousResult) {
      RestoreManager.previousResult = null;
    }
    RestoreManager.restoredFinalBalance = 0;
    RestoreManager.currentIndexes.base_spin_index = 0;
    RestoreManager.currentIndexes.bonus_spin_index = 0;
  }
}
