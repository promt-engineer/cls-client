const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'configs',
      assets: [
        {
          alias: 'winTextStyles',
          src: 'textStyles.json'
        }
      ]
    },
    {
      name: 'sprites',
      assets: [
        {
          alias: 'win-plate',
          src: 'plate.png'
        }
      ],
    },
  ],
};

export default manifest;
