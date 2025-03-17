const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'configs',
      assets: [
        {
          alias: 'soundConfig',
          src: 'soundConfig.json',
        },
      ],
    },
    {
      name: 'fonts',
      assets: [
        {
          alias: 'colus_regular',
          src: 'colus_regular.OTF',
          data: { fontFamily: 'colus_regular', fontWeight: '400' },
        },
        {
          alias: 'russoone_regular',
          src: 'RussoOne-Regular.woff2',
          data: { fontFamily: 'colus_regular', fontWeight: '400' },
        },
      ],
    },
  ],
};

export default manifest;
