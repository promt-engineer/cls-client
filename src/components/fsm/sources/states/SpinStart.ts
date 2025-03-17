import { State } from '@base/fsm/sources/State';
import { App } from '@/components/game/sources/App';
import { FsmState } from '@/components/fsm/sources/enums';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { FSM } from '@base/fsm/sources/FSM';
import { UIController } from '@/components/ui/sources/UIController';

export class SpinStart extends State {
  constructor() {
    super(FsmState.SpinStart);
  }

  async onEnter() {
    RestoreManager.reset();

    const data = await App.$instance.network.makeSpin();

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
