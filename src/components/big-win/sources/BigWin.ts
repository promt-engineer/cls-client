import { Assets, Text, TextStyle } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { SizeConfig } from '@/utils/SizeConfig';
import DummySymbol from '@/components/reelset/sources/view/DummySymbol';
import { BigWin as Base } from '@base/big-win/sources/BigWin';

export class BigWin extends Base {
  protected maxAmountWidth = 475;
  protected layer = LayerManager.layers.get('foreground')!;

  constructor() {
    super();
  }

  protected createBigWin(): void {
    super.createBigWin();
    this.bigWin.x = -20;
  }

  protected onResize(): void {
    if (SizeConfig.isLandscape) {
      this.bigWin.scale.set(1);
    } else {
      this.bigWin.scale.set(0.72);
    }
  }

  protected createWinAmountText(): void {
    this.winAmount.text = new Text(0, Assets.get<Partial<TextStyle>>('bigWinFontStyle'));
    this.winAmount.text.anchor.set(0.47, 0.56);
    this.bigWin.attachToSlot('123.45$', this.winAmount.text);
  }

  protected getMusicName(): string {
    const state = DummySymbol.backgroundType;

    return state === 'fs' ? 'back_fs' : 'back';
  }
}
