import { SpineAnimation } from 'gh-client-base';
import { SizeConfig } from '@/utils/SizeConfig';
import { LayerManager } from '@base/game/sources/LayerManager';

export class WinLine extends SpineAnimation {
  constructor(paylineConfig: Payline) {
    super(`winline_${paylineConfig.winLineType}`);

    this.position.set(SizeConfig.winLineX, SizeConfig.getWinLineYForRow(paylineConfig.line[0]));

    if (paylineConfig.reversed) {
      this.scale.y = -1;
    }

    LayerManager.layers.get('foreground')?.addChild(this);
  }

  public showWinLine(): void {
    this.play('animation');
  }
}
