import { FsmState as Base } from '@base/fsm/sources/enums';

/**
 * TODO: There aren't Win, BigWin and ShowWin states in this game.
 * Need to create such states instead of "Avalanche"
 */
export const FsmState = {
  ...Base,

  'FreeSpin' : 'FreeSpin',
  'BuyBonus' : 'BuyBonus',
  'BuyBonusSpin' : 'BuyBonusSpin',
  'FSGame' : 'FSGame',
  'Avalanche' : 'Avalanche',
  'GambleState' : 'GambleState',
} as const;
