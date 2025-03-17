import { State } from '@base/fsm/sources/State';
import { FsmState } from '@/components/fsm/sources/enums';
import { App } from '@/components/game/sources/App';
import { UIController } from '@/components/ui/sources/UIController';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { FSM } from '@base/fsm/sources/FSM';

export class BuyBonus extends State {
  constructor() {
    super(FsmState.BuyBonus);
  }

  async onEnter() {
    RestoreManager.reset();

    const data = await App.$instance.network.sendBuyBonus();

    if (data) {
      await App.$instance.game.reelset.startSpin();

      return data.game_results;
    } else {
      FSM.$instance.clearCurrentSequence();
      UIController.emitter.emit('spin-end');

      return;
    }
  }
}
