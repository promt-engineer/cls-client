import fsmBase from 'gh-client-base/src/data/fsm';
import { FsmState } from '@/components/fsm/sources/enums';

const fsm: { entry: Fsm.State; sequences: Partial<Record<Fsm.State, Fsm.State[]>> } = {
  entry: fsmBase.entry,
  sequences: {
    [FsmState.Start]: fsmBase.sequences.Start,
    [FsmState.SpinSymbols]: fsmBase.sequences.SpinSymbols,
    [FsmState.Spin]: [FsmState.SpinSymbols, FsmState.Avalanche, FsmState.FreeSpin],
    [FsmState.BuyBonusSpin]: [FsmState.BuyBonus, FsmState.SpinStop, FsmState.Avalanche, FsmState.FreeSpin],
    [FsmState.FSGame]: [FsmState.Avalanche, FsmState.FreeSpin],
    [FsmState.Restore]: [FsmState.Avalanche, FsmState.FreeSpin],
  },
};

export default fsm;


