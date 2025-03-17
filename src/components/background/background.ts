const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'sprites',
      assets: [
        {
          alias: 'background',
          src: 'background/background.png',
          priority: 'high',
        },
        {
          alias: 'reel',
          src: 'background/reels.png',
          priority: 'high'
        },
        {
          alias: 'backgroundMegaways',
          src: 'megaways/flexiwaysCounterPlate.png',
        },
        {
          alias: 'logo',
          src: 'megaways/logo.png',
          priority: 'high'
        },
        {
          alias: 'plateBB',
          src: 'buyBonusPanel/plateBackground.png',
        },
        {
          alias: 'btn-disabled',
          src: 'buyBonusPanel/btn_disabled.png',
        },
        {
          alias: 'btn-hover',
          src: 'buyBonusPanel/btn_hover.png',
        },
        {
          alias: 'btn-normal',
          src: 'buyBonusPanel/btn_normal.png',
        },
        {
          alias: 'btn-pressed',
          src: 'buyBonusPanel/btn_pressed.png',
        },
        {
          alias: 'Multiplier_counter_plate',
          src: 'Multiplier_counter_plate.png',
          priority: 'high'
        },
      ],
    },
    {
      name: 'configs',
      assets: [
        {
          alias: 'counterFontStyles',
          src: 'font-styles-counter.json',
          priority: 'high'
        },
      ],
    },
    {
      name: 'skeletons',
      assets: [
        {
          alias: 'bg-desktop',
          src: 'bg-desktop/Cleos Riches F_background_desktop_animation.json',
          priority: 'high'
        },
        {
          alias: 'bg-mobile',
          src: 'bg-mobile/Cleos Riches F_background_mobile_animation.json',
          priority: 'high'
        }
      ]
    },
    {
      name: 'fonts',
      assets: [
        {
          alias: 'AntiquaSTBold',
          src: 'SquareAntiqua-Bold.ttf',
          data: { family: 'AntiquaSTBold' },
          useInCss: true
        },
        {
          alias: 'AntiquaSTBook',
          src: 'SquareAntiqua-Book.ttf',
          data: { family: 'AntiquaSTBook' },
        },
      ],
    },
  ],
};

export default manifest;
