declare namespace Linguist {
  type TextKeys =
      'gamble_lose' 
    | 'max_win'
    | 'gamble_congrats'
    | 'red'    
    | 'black'
    | 'collect'
    | 'choose_red_or_black'
    | 'gamble'
    | 'gamble_variant_1'
    | 'gamble_variant_2'
    | 'gamble_placeholder'
    | 'buy_bonus'
    | 'multiplier'
    | 'free_spins'
    | 'choice_starting_multiplier'
    | 'choice_mutiplier_text'
    | 'fs_congratulations'
    | 'fs_you_won'
    | 'fs_in'
    | 'are_you_sure'
    | 'double_chance'
    | 'on'
    | 'off'
    | 'balance'
    | 'win'
    | 'bet'
    | 'fs_left'
    | 'paytable'
    | 'fs_rules'
    | 'game_features'
    | 'general_rules'
    | 'settings'
    | 'autoplay'
    | 'music_volume'
    | 'sound_volume'
    | 'mute'
    | 'autoplay_stop'
    | 'any_win'
    | 'fs_won'
    | 'if_win_exceed'
    | 'if_balance_increase'
    | 'if_balance_decrease'
    | 'continue'
    | 'mystery'
    | 'press_anywhere'
    | 'bonus_popup_yes'
    | 'bonus_popup_no'
    | 'random_phrase_1'
    | 'free_spins_summary'
    | 'random_phrase_2'
    | 'random_phrase_3'
    | 'info.wild_description'
    | 'info.scatter_description'
    | 'info.buy_bonus'
    | 'info.buy_bonus_description'
    | 'info.double_chance'
    | 'info.double_chance_description'
    | 'info.cascade_feature'
    | 'info.cascade_feature_description'
    | 'info.ways_to_win'
    | 'info.ways_to_win_description'
    | 'info.ways_to_win_description2'
    | 'info.ways_to_win_description3'
    | 'info.free_spins_rules'
    | 'info.free_spins_rules_description.0'
    | 'info.free_spins_rules_description.1'
    | 'info.free_spins_rules_description.2'
    | 'info.free_spins_rules_bottom_description.0'
    | 'info.free_spins_rules_bottom_description.1'
    | 'info.free_spins_rules_bottom_description.2'
    | 'info.game_rules'
    | 'info.game_rules_description.0'
    | 'info.game_rules_description.1'
    | 'info.game_rules_description.2'
    | 'info.game_rules_description.3'
    | 'info.game_rules_description.4'
    | 'info.game_rules_description.5'
    | 'info.game_rules_description.6'
    | 'info.scatters_table.0.0'
    | 'info.scatters_table.0.1'
    | 'info.scatters_table.0.2'
    | 'info.scatters_table.0.3'
    | 'info.scatters_table.1.0'
    | 'info.scatters_table.1.1'
    | 'info.scatters_table.1.2'
    | 'info.scatters_table.1.3'
    | 'info.scatters_table.2.0'
    | 'info.scatters_table.2.1'
    | 'info.scatters_table.2.2'
    | 'info.scatters_table.2.3'
    | 'info.how_to_play'
    | 'info.how_to_play_description.0'
    | 'info.how_to_play_description.1'
    | 'info.how_to_play_description.2'
    | 'info.how_to_play_description.3'
    | 'info.how_to_play_description.4'
    | 'info.how_to_play_description.5'
    | 'info.how_to_play_description.6'
    | 'info.how_to_play_description.7'
    | 'history_transaction_1'
    | 'history_transaction_2'
    | 'history_transaction_3'
    | 'history_transaction_4'
    | 'history_transaction_title'
    | 'history_fs_transaction_title'
    | 'history_spins'
    | 'history_game_data_title'
    | 'history_game_data_1'
    | 'history_game_data_2'
    | 'history_game_data_3'
    | 'history_loading'
    | 'history_no_history'
    | 'history_title'
    | 'history_fs'
    | 'onboarding_switcher_text';
}

declare namespace Win {
  export type WinAmount = {
    value: number,
    finalValue: number,
    text: import('pixi.js').Text | null,
  }
}

declare namespace Network {
  export interface WagerBody {
    engine_params: {
      ante_bet: boolean;
    };
  }

  interface GenerateBonusBody {
    engine_params: BonusChoice;
  }

  export interface ISpinData {
    buy_bonus: boolean;
    ante_bet: boolean;
    bonus_choice: BonusChoice[] | null;
    avalanches: Avalanche[];
    award: number;
    bonus: Bonus | null;
    wager: number;
    stops: number[];
    gambles: any;
  }

  interface PayItem {
    symbol: number;
    indexes: Array<number[] | null>;
    award: number;
    multiplier?: number;
    award_with_multiplier?: number;
  }

  interface Avalanche {
    window: import('@/components/reelset/sources/enums').SymbolIndex[][];
    pay_items: PayItem[] | null;
  }

  interface Bonus {
    award: number;
    spins: BonusSpin[];
  }

  export interface BonusChoice {
    spins: number;
    multiplier: number;
    random: boolean;
  }

  interface BonusSpin {
    stops: number[];
    award: number;
    bonus_spins_left: number;
    bonus_spins_triggered: number;
    multiplier: number[];
    avalanches: Avalanche[];
  }

  export interface IRestoringIndexes {
    base_spin_index: number;
    bonus_spin_index: number;
  }

  export interface ISpinResult {
    balance: number;
    currency: string;
    game: string;
    game_results: IGameResults;
    session_token: string;
    user_id: string;
}

  export interface IHistorySpin {
    base_award: number;
    bonus_award: number;
    created_at: string;
    currency: string;
    end_balance: number;
    game: string;
    id: string;
    restoring_indexes: IRestoringIndexes;
    spin: ISpinData;
    start_balance: number;
    transaction_id: string;
    updated_at: string;
    user_id: string;
    wager: number;
    fs: boolean;
  }
  
  export interface IHistorySpinBonus {
    base_award: number;
    bonus_award: number;
    created_at: string;
    currency: string;
    end_balance: number;
    game: string;
    id: string;
    restoring_indexes: IRestoringIndexes;
    spin: BonusSpin;
    start_balance: number;
    transaction_id: string;
    updated_at: string;
    user_id: string;
    wager: number;
    fs: boolean;
  }

  export interface HistoryBody {
    count: number;
    page: number;
    records: IHistorySpin[];
    total: number;
  }

  export interface HistoryRes {
    data: HistoryBody
  }
}

declare namespace AssetsPreloader {
  interface ManifestAsset extends UnresolvedAsset {
    priority?: Priority;
    useInCss?: boolean;
    alias?: string[] | string;
    src?: string;
    data?: any;
  }

  interface ManifestBundle extends AssetsBundle {
    name: BundleName;
    assets: ManifestAsset[];
  }

  export interface Manifest {
    bundles: ManifestBundle[];
  }
}
