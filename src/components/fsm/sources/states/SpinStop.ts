import { State } from '@base/fsm/sources/State';
import { FsmState } from '@/components/fsm/sources/enums';
import { App } from '@/components/game/sources/App';
import { Timings } from '@/components/reelset/sources/types';
import { Assets } from 'pixi.js';
import { StateData } from '@/components/fsm/sources/states/FreeSpin';

export class SpinStop extends State {
  public readonly options = {
    timings: Assets.get<Timings>('timings').regularSpin,
  };
  constructor() {
    super(FsmState.SpinStop);
  }

  async onEnter(data: Network.IGameResults): Promise<StateData> {
    const { window } = data.spin.avalanches[0];
    await App.$instance.game.reelset.stopSpin(window);

    return { data, avalanches: data.spin.avalanches };
  }
}
