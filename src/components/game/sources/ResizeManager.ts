import { utils } from 'pixi.js';
import { SizeConfig } from '@/utils/SizeConfig';
import { LayerManager } from '@base/game/sources/LayerManager';
import { ResizeManager as Base } from '@base/game/sources/ResizeManager';

export class ResizeManager extends Base {
  constructor() {
    super();
  }

  protected onResizeLandscape() {
    LayerManager.layers.get('reelset')?.scale.set(1);
    LayerManager.layers.get('foreground')?.scale.set(1);
    LayerManager.layers.get('popups')?.scale.set(1);
    LayerManager.layers.get('onboarding')?.scale.set(0.95);

    if (utils.isMobile.any) {
      if (ResizeManager.landscapeMode === 1) {
        const scale = Math.min(1, innerWidth / SizeConfig.gameSize.width * (SizeConfig.gameSize.height / innerHeight) * 1.1);
        LayerManager.layers.get('reelset')?.scale.set(scale);
        LayerManager.layers.get('onboarding')?.scale.set(scale / 1.1);
        LayerManager.layers.get('foreground')?.scale.set(scale);
        LayerManager.layers.get('popups')?.scale.set(scale / 1.05);
      }

      if (ResizeManager.landscapeMode === 2) {
        const scale = Math.min(1, innerHeight / SizeConfig.gameSize.height * (SizeConfig.gameSize.width / innerWidth) * 1.15);
        LayerManager.layers.get('reelset')?.scale.set(scale / 1.05);
        LayerManager.layers.get('onboarding')?.scale.set(scale / 1.2);
        LayerManager.layers.get('foreground')?.scale.set(scale);
        LayerManager.layers.get('popups')?.scale.set(scale / 1.05);
      }
    }
  }

  protected onResizePortrait() {
    LayerManager.layers.get('reelset')?.scale.set(0.8);
    LayerManager.layers.get('foreground')?.scale.set(0.85);
    LayerManager.layers.get('onboarding')?.scale.set(0.95);

    if (ResizeManager.portraitMode === 1) {
      LayerManager.layers.get('popups')?.scale.set(1);
    } else {
      const scale = Math.min(0.9, (SizeConfig.gameSize.width / innerWidth) / (innerHeight / SizeConfig.gameSize.height) / 2);
      LayerManager.layers.get('popups')?.scale.set(scale);
    }
  }
}
