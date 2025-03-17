const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'skeletons',
      assets: [
        {
          alias: 'fs-summary-popup',
          src: 'fs-summary/Cleo\'s Riches_free spins summary_animation.json'
        }
      ],
    },
    {
      name: 'configs',
      assets: [
        {
          alias: 'fsTextStyles',
          src: 'textStyles.json'
        }
      ],
    },
    {
      name: 'sprites',
      assets: [
        {
          alias: 'multiplier-prize',
          src: 'prizeMultiplier.png',
        },
        {
          alias: 'additional-fs',
          src: 'plate.png',
        },
        {
          alias: 'fsPrize-button-hover',
          src: 'prizeBackground/hover.png',
        },
        {
          alias: 'fsPrize-button-normal',
          src: 'prizeBackground/normal.png',
        },
        {
          alias: 'fsPrize-button-pressed',
          src: 'prizeBackground/pressed.png',
        },
        {
          alias: 'fsPrize-button-disabled',
          src: 'prizeBackground/disabled.png',
        },
      ],
    },
  ],
};

export default manifest;
