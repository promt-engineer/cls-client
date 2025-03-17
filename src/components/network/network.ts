const manifest: AssetsPreloader.Manifest = {
  bundles: [
    {
      name: 'configs',
      assets: [
        {
          alias: 'datamock',
          src: 'datamock.json',
        },
        {
          alias: 'sessionConfig',
          src: 'sessionConfig.json',
          priority: 'high',
        },
        {
          alias: 'sessionConfigLocal',
          src: 'sessionConfigLocal.json',
          priority: 'high',
          optional: true,
        },
      ],
    },
  ],
};

export default manifest;
