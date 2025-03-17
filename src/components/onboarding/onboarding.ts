const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'sprites',
      assets: [
        {
          alias: 'dot-normal',
          src: 'dot/Dot_1_normal.png',
          priority: 'high',
        },
        {
          alias: 'dot-active',
          src: 'dot/Dot_1_active.png',
          priority: 'high',
        },
        {
          alias: 'loading-plate',
          src: 'loading-plate.png',
          priority: 'high',
        },
        {
          alias: 'loading-progress',
          src: 'loading-progress.png',
          priority: 'high',
        },
        {
          alias: 'continue-button-hover',
          src: 'continue-button/hover.png',
          priority: 'high',
        },
        {
          alias: 'continue-button-normal',
          src: 'continue-button/normal.png',
          priority: 'high',
        },
        {
          alias: 'continue-button-pressed',
          src: 'continue-button/pressed.png',
          priority: 'high',
        },
        {
          alias: 'continue-button-disabled',
          src: 'continue-button/disabled.png',
          priority: 'high',
        },
        {
          alias: 'dont-show-off',
          src: 'dont-show/show-off.png',
          priority: 'high',
        },
        {
          alias: 'dont-show-on',
          src: 'dont-show/show-on.png',
          priority: 'high',
        },
      ],
    },
    {
      name: 'configs',
      assets: [
        {
          alias: 'phrases',
          src: 'phrases.json',
          priority: 'high',
        },
        {
          alias: 'onboardingFontStyles',
          src: 'font-styles.json',
          priority: 'high',
        },
        {
          alias: 'switcherButtonConfig',
          src: 'switcherButton.json',
          priority: 'high',
        },
        {
          alias: 'continueButtonConfig',
          src: 'continueButton.json',
          priority: 'high',
        },
      ],
    },
    {
      name: 'fonts',
      assets: [
        {
          alias: 'ResagokrBold',
          src: 'ResagokrBold.otf',
          priority: 'high',
        },
      ],
    },
    {
      name: 'skeletons',
      assets: [
        {
          alias: 'slide_crash',
          src: 'crash/crash_1.json',
          priority: 'high',
        },
        {
          alias: 'slide-1',
          src: 'crash/crash_sym.json',
          priority: 'high',
        },
        {
          alias: 'slide-2',
          src: 'multi/on_multiplayer.json',
          priority: 'high',
        },
        {
          alias: 'slide-3',
          src: 'scatter/SCATTER_size_1.json',
          priority: 'high',
        }
      ]
    }
  ],
};

export default manifest;
