import { LinguistStore, localize, parse } from 'gh-client-base';

export const setLanguage = async (language: string) => {
  LinguistStore.lang = language;
  const dict_data = await require('../components/game/resources/translations/localisation.csv');

  LinguistStore.dict = parse(dict_data.default);
};

export function getWords(): Record<string, string> {
  return {
    balance: localize('balance', true),
    win: localize('win', true),
    bet: localize('bet', true),
    fsLeft: `${localize('fs_left', true)}:`,
    paytable: localize('paytable', true),
    fsRules: localize('fs_rules', true),
    gameFeatures: localize('game_features').toUpperCase(),
    generalRules: localize('general_rules').toUpperCase(),
    settings: localize('settings').toUpperCase(),
    autoplay: localize('autoplay').toUpperCase(),
    musicVolume: localize('music_volume').toUpperCase(),
    soundVolume: localize('sound_volume').toUpperCase(),
    mute: localize('mute').toUpperCase(),
    autoplayStop: localize('autoplay_stop').toUpperCase(),
    anyWin: localize('any_win').toUpperCase(),
    fsWon: localize('fs_won', true),
    ifWinExceed: localize('if_win_exceed').toUpperCase(),
    ifBalanceIncrease: localize('if_balance_increase').toUpperCase(),
    ifBalanceDecrease: localize('if_balance_decrease').toUpperCase(),
    buyBonus: localize('info.buy_bonus').toUpperCase(),
    buyBonusDescription: localize('info.buy_bonus_description', true),
    doubleChance: localize('info.double_chance').toUpperCase(),
    doubleChanceDescription: localize('info.double_chance_description', true),
    cascadeFeature: localize('info.cascade_feature').toUpperCase(),
    cascadeFeatureDescription: localize('info.cascade_feature_description', true),
    waysToWin: localize('info.ways_to_win').toUpperCase(),
    waysToWinDescription: localize('info.ways_to_win_description', true),
    waysToWinDescription2: localize('info.ways_to_win_description2', true),
    waysToWinDescription3: localize('info.ways_to_win_description3', true),
    freeSpinsRules: localize('info.free_spins_rules').toUpperCase(),
    freeSpinsRulesDescription: localize('info.free_spins_rules_description.0', true) +
      '<br>' +
      localize('info.free_spins_rules_description.1', true) +
      '<br>' +
      localize('info.free_spins_rules_description.2', true),
    freeSpinsRulesBottomDescription: localize('info.free_spins_rules_bottom_description.0', true)
      + '<br>' +
      localize('info.free_spins_rules_bottom_description.1', true)
      + '<br>' +
      localize('info.free_spins_rules_bottom_description.2', true),
    gameRules: localize('info.game_rules').toUpperCase(),
    gameRulesDescription: localize('info.game_rules_description.0', true) +
      '<br>' +
      localize('info.game_rules_description.1', true) +
      '<p></p>' +
      localize('info.game_rules_description.2', true) +
      '<br>' +
      localize('info.game_rules_description.3', true) +
      '<p></p>' +
      localize('info.game_rules_description.4', true) +
      '<br>' +
      localize('info.game_rules_description.5', true) +
      '<p></p>' +
      localize('info.game_rules_description.6', true),
    howToPlay: localize('info.how_to_play').toUpperCase(),
    showOnboarding: localize('onboarding_switcher_text', true).toUpperCase(),
  };
}

export function getScattersTable(): string[][] {
  return [
    [
      localize('info.scatters_table.0.0').toUpperCase(),
      localize('info.scatters_table.0.1', true),
      localize('info.scatters_table.0.2', true),
      localize('info.scatters_table.0.3', true),
    ],
    [
      localize('info.scatters_table.1.0', true),
      localize('info.scatters_table.1.1', true),
      localize('info.scatters_table.1.2', true),
      localize('info.scatters_table.1.3', true),
    ],
    [
      localize('info.scatters_table.2.0', true),
      localize('info.scatters_table.2.1', true),
      localize('info.scatters_table.2.2', true),
      localize('info.scatters_table.2.3', true),
    ],
  ];
}
