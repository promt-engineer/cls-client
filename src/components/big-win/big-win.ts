const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'fonts',
      assets: [
        {
          alias: 'sudburb',
          src: 'sudburb.otf',
          data: { fontFamily: 'sudburb' },
        },
      ]
    },
    {
      name: 'skeletons',
      assets: [
        {
          alias: 'big-win',
          src: 'big-win/Cleo\'s Riches_big win_animation.json',
        },
      ],
    },
    {
      name: 'configs',
      assets: [
        {
          alias: 'winAnimationsSequence',
          src: 'animationsSequence.json',
        },
        {
          alias: 'winConfig',
          src: 'config.json',
        },
        {
          alias: 'bigWinFontStyle',
          src: 'bigWinFontStyle.json',
        },
      ],
    },
  ],
};

export default manifest;
