const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'sprites',
      assets: [
        {
          alias: 'doubleChancePanel',
          src: 'button_plate_normal.png',
        },
        {
          alias: 'switcherSection',
          src: 'switcher-section.png',
        },
        {
          alias: 'betRedButton',
          src: 'bet_red_button.png',
        },
        {
          alias: 'betGreenButton',
          src: 'bet_green_button.png',
        },
      ],
    },
    {
      name: 'configs',
      assets: [
        {
          alias: 'doubleChanceTextStyles',
          src: 'textStyle.json'
        }
      ]
    }
  ],
};

export default manifest;
