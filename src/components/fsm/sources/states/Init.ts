import { State } from '@base/fsm/sources/State';
import { FSM } from '@base/fsm/sources/FSM';
import { FsmState } from '@/components/fsm/sources/enums';
import {
  Avalanche,
  BuyBonus,
  FreeSpin,
  SpinStart,
  SpinStop,
} from '@/components/fsm/sources/states';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import { App } from '@/components/game/sources/App';
import { GlobalStore } from '@base/game/sources/global-store/GlobalStore';
import { waitForEvent } from 'gh-client-base';
import { Gamble } from '@base/gamble/sources/Gamble';

export class Init extends State {
  protected gamble: Gamble;
  constructor() {
    super(FsmState.Init);
  }

  async onEnter() {
    FSM.$instance.addState('SpinStart', new SpinStart());
    FSM.$instance.addState('SpinStop', new SpinStop());
    FSM.$instance.addState('FreeSpin', new FreeSpin());
    FSM.$instance.addState('BuyBonus', new BuyBonus());
    FSM.$instance.addState('Avalanche', new Avalanche());
  }

  async onExit(): Promise<any> {
    App.$instance.soundController.play(RestoreManager.isFreeSpinsRestored ? 'back_fs' : 'back');

    if(RestoreManager.previousResult) {
      RestoreManager.previousResult.can_gamble = false;
      RestoreManager.previousResult.spin.award = 0;
    }


    if (RestoreManager.previousResult?.can_gamble) {
      this.gamble = new Gamble();
      if (!RestoreManager.previousResult!.spin.gambles) {
        GlobalStore.balance -= RestoreManager.previousResult!.spin.award;
        App.$instance.eventEmitter.emit('update-balance', GlobalStore.balance);
        this.gamble.enableButtonsOnGamble();
      } else{
        const lastGamble = RestoreManager.previousResult.spin.gambles[RestoreManager.previousResult.spin!.gambles.length - 1].award;
        GlobalStore.balance -= lastGamble,
        App.$instance.eventEmitter.emit('update-balance', GlobalStore.balance); 
        App.$instance.eventEmitter.emit('accumulate-win', lastGamble);
        RestoreManager.previousResult!.spin.gambles.forEach((element: any) => {
          this.gamble.setCard(element.expected_pick === 1 ? 'r' : 'b', false);
        });
        this.gamble.enableButtonsOnGamble();
        this.gamble.blockUIBtns(true);
        this.gamble.gampleButtonCollect.position.x = 0;

        this.gamble.showGamblePopup()
      }

      // await waitForEvent('gamble-game');
    }

    if (!RestoreManager.isRestoringCompleted) {
      FSM.$instance.addNextState('Restore');

      return {
        data: RestoreManager.previousResult,
        avalanches: RestoreManager.previousResult?.spin.avalanches,
      };
    } else if (RestoreManager.previousResult && RestoreManager.previousResult.spin.award && !RestoreManager.previousResult.spin.gambles) {
      App.$instance.eventEmitter.emit(
        'accumulate-win',
        RestoreManager.previousResult.spin.award,
        true,
      );

      if (App.$instance.quickActions.PFR.isFreeSpinning && RestoreManager.previousResult.is_pfr) {
        App.$instance.quickActions.PFR.updateWinnings(GlobalStore.win);
      }
    }
  }
}
