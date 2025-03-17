import { Color, Text } from 'pixi.js';
import { rescaleToWidth } from 'gh-client-base';
import { ResizeManager } from '@/components/game/sources/ResizeManager';
import { SizeConfig } from '@/utils/SizeConfig';
import { DoubleChance as Base } from '@base/double-chance/sources/DoubleChance';
import UIState from 'gh-client-base/src/components/ui/sources/UIState';
import { RestoreManager } from '@/components/network/sources/RestoreManager';

const config: DoubleChance.Config = {
  betAmountWidth: 200,
  coefficient: 1.25,
  panelPosition: {
    x: -800,
    y: 200,
  },
  xSwitchOffset: 31,
  titlePosition: {
    x: 0,
    y: -110,
  },
  betAmountPosition: {
    x: 0,
    y: -50,
  },
  descriptionPosition: {
    x: 0,
    y: 25,
  },
  buttonPosition: {
    x: -31,
    y: 0,
  },
  buttonSectionPosition: {
    x: 0,
    y: 105,
  },
};

export class DoubleChance extends Base {
  protected descriptionWordWrapWidth = 150;

  constructor() {
    super(config);
  }

  public makeTransparent(isTransparent: boolean): void {
    this.panel.alpha = isTransparent ? 0.5 : 1;
    this.buttonSection.alpha = isTransparent ? 1.8 : 1;
    this.buttonSection.children[0].alpha = isTransparent ? 0.5 : 1;
    this.buttonSection.children[1].alpha = isTransparent ? 0.5 : 1;
  }

  protected onUiUpdate(): void {
    if (UIState.doubleChance.disabled){// || RestoreManager.previousResult?.can_gamble) {
      this.buttonSection.eventMode = 'auto';
      this.buttonSection.cursor = 'auto';
      this.redButton.tint = new Color('#b2b2b2');
      this.makeTransparent(true); 
    } else {
      this.buttonSection.eventMode = 'static';
      this.buttonSection.cursor = 'pointer';
      this.redButton.tint = 0xffffff;
      this.makeTransparent(false); 
    }

    if (UIState.doubleChance.blockedByPFR) {
      this.switch(false);
    }

    this.panel.visible = !UIState.doubleChance.hidden;
  }

  protected onResize(): void {
    super.onResize();

    if (ResizeManager.isPortrait) {
      this.betAmountWidth = 130;
      this.descriptionWordWrapWidth = 200;

      const scale = Math.min(
        1.5,
        SizeConfig.gameSize.width /
          window.innerWidth /
          (window.innerHeight / SizeConfig.gameSize.height),
      );

      this.panel.anchor.set(0.5);
      this.panel.position.set(480, Math.max(550, SizeConfig.gameSize.height * 0.4));
      this.panel.scale.set(scale);

      this.title.anchor.set(0, 0.5);
      rescaleToWidth(this.title, 55);
      this.title.position.set(-this.panel.width * 0.25, -50);

      this.betAmount.position.set(30, -50);

      if (this.description.height > 90) {
        rescaleToWidth(this.description, 90);
      } else {
        this.description.scale.set(0.8);
      }
      this.description.position.set(0, -5);

      this.buttonSection.y = 46;
      this.buttonSection.scale.set(0.8);
    } else {
      this.betAmountWidth = 200;
      this.descriptionWordWrapWidth = 150;

      this.panel.anchor.set(0.5);
      this.panel.position.set(-800, 200);
      this.panel.scale.set(1);

      this.title.anchor.set(0.5);
      rescaleToWidth(this.title, 180);
      this.title.position.set(0, -110);
      this.betAmount.position.set(0, -50);
      this.description.position.set(0, 25);
      if (this.description.height > 100) {
        rescaleToWidth(this.description, 125);
      } else {
        rescaleToWidth(this.description, 190);
      }

      this.buttonSection.y = 105;
      this.buttonSection.scale.set(1);
    }

    this.description.style.wordWrapWidth = this.descriptionWordWrapWidth;

    rescaleToWidth(this.betAmount, this.betAmountWidth);
  }

  protected setSwitcherTextPosition(on: Text, off: Text): void {
    on.x = -(this.buttonSection.width / 2 - 40);
    off.x = this.buttonSection.width / 2 - 43;
    rescaleToWidth(on, 70);
    rescaleToWidth(off, 70);
  }
}
