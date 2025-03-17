import { State } from '@base/fsm/sources/State';
import { App } from '@/components/game/sources/App';
import { AssetsPreloader } from '@/components/game/sources/assets-loader/AssetsPreloader';
import { FsmState } from '@/components/fsm/sources/enums';
import { LayerManager } from '@base/game/sources/LayerManager';
import { RestoreManager } from '@/components/network/sources/RestoreManager';
import UIState from '@base/ui/sources/UIState';
import { UIController } from '@/components/ui/sources/UIController';
import { waitForEvent } from 'gh-client-base';
import { UIIndicators } from '@base/ui/sources/UIIndicators';
import { ServerAdapter } from '@base/network/sources/ServerAdapter';
import { sleep } from 'gh-client-base';
import { GlobalStore } from '@base/game/sources/global-store/GlobalStore';

export class Load extends State {
  constructor() {
    super(FsmState.Load);
  }

  async onEnter(data?: any) {
    App.$instance.loader = new AssetsPreloader();

    await App.$instance.loader.beforePreload();
    await App.$instance.loader.preloadHighPriorityAssets();

    return super.onEnter(data);
  }

  async onProgress(data?: any): Promise<any> {
    App.$instance.initConfigs();

    waitForEvent(ServerAdapter.events.FREESPINS_ACCEPTED_EVENT).then(() => {
      UIIndicators.PFR = true;
    });

    await App.$instance.initNetwork();
    GlobalStore.change_onbording = true;

    GlobalStore.setShowSwitcherOnboarding = true;
    if(
      window.localStorage.getItem("showOnboarding") === 'false' || 
      window.localStorage.getItem("showOnboarding") === null
    ) {
      await sleep(2000);
      const startScreen = document.querySelector('.start-screen');
      if (startScreen) {
        startScreen.remove();
      }
    }
    document.querySelector('.start-screen-background')?.remove();

    App.$instance.createApp();

    LayerManager.layers.get('game')!.eventMode = 'none';

    await App.$instance.onboarding.show();

    App.$instance.eventEmitter.on('load-progress', (value) =>
      App.$instance.onboarding.updateProgress(value),
    );

    await App.$instance.loader.preload();

    App.$instance.eventEmitter.off('load-progress');

    return super.onProgress(data);
  }

  async onExit(data?: any): Promise<any> {
    GlobalStore.is_free_bet = true;
    await App.$instance.createGame();

    if (RestoreManager.isChooseBonusRestored || RestoreManager.isFreeSpinsRestored) {
      UIState.buyBonus.hidden = true;
      UIState.doubleChance.hidden = true;

      UIController.emitter.emit('update');
    }

    await App.$instance.onboarding.showContinue();

    App.$instance.eventEmitter.emit('show-ui');

    LayerManager.layers.get('game')!.eventMode = 'auto';

    return super.onExit(data);
  }
}
