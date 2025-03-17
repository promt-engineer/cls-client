import { audio } from '@assetpack/plugin-ffmpeg';
import { compressPng, compressWebp } from '@assetpack/plugin-compress';

export default {
  entry: './assets',
  output: './public/',
  plugins: {
    audio: audio(),
    compressWebp: compressWebp(),
    compressPng: compressPng(),
  },
};
