const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'skeletons',
      assets: [
        {
          alias: 'crash',
          src: 'crash/skeleton.json'
        },
        {
          alias: 'symbol_1',
          src: 'symbol_1/Cleo_animation_size_1_2509.json'
        },
        {
          alias: 'symbol_2',
          src: 'symbol_5/Eye_stone_size_1.json'
        },
        {
          alias: 'symbol_3',
          src: 'symbol_3/Bird_stone_size_1_0210 (1).json'
        },
        {
          alias: 'symbol_4',
          src: 'symbol_4/Snake_stone_size_1.json'
        },
        {
          alias: 'symbol_5',
          src: 'symbol_2/Cat_stone_size_1.json'
        },
        {
          alias: 'low_symbol',
          src: 'low_symbol/10_Royals_stone_size_1.json'
        },
        {
          alias: 'symbol_11',
          src: 'symbol_11/WILD sun_animation_size_3_0910.json'
        },
        {
          alias: 'symbol_12',
          src: 'symbol_12/SCATTER_size_1.json'
        },
      ]
    },
    {
      name: 'configs',
      assets: [
        {
          alias: 'config',
          src: 'config.json',
          priority: 'high',
        },
        {
          alias: 'mask',
          src: 'mask.json',
        },
        {
          alias: 'timings',
          src: 'timings.json',
        },
        {
          alias: 'paylines',
          src: 'paylines.json',
        },
      ],
    },
  ],
};

export default manifest;
