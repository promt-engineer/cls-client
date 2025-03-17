const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'configs',
      assets: [
        {
          alias: 'bonusTextStyles',
          src: 'textStyle.json'
        }
      ],
    },
    {
      name: 'sprites',
      assets: [
        {
          alias: 'backgroundBB',
          src: 'buyBonus/buyBonusPopupPlate.png',
        },
        {
          alias: 'yes-btn-disabled',
          src: 'buyBonus/yes_btn_disabled.png',
        },
        {
          alias: 'yes-btn-hover',
          src: 'buyBonus/yes_btn_hover.png',
        },
        {
          alias: 'yes-btn-normal',
          src: 'buyBonus/yes_btn_normal.png',
        },
        {
          alias: 'yes-btn-pressed',
          src: 'buyBonus/yes_btn_pressed.png',
        },
        {
          alias: 'no-btn-disabled',
          src: 'buyBonus/no_btn_disabled.png',
        },
        {
          alias: 'no-btn-hover',
          src: 'buyBonus/no_btn_hover.png',
        },
        {
          alias: 'no-btn-normal',
          src: 'buyBonus/no_btn_normal.png',
        },
        {
          alias: 'no-btn-pressed',
          src: 'buyBonus/no_btn_pressed.png',
        },
      ],
    },
  ],
};

export default manifest;
