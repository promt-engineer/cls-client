import { Assets, ITextStyle, Sprite, Text, Texture } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { Button, Gsap, localize, rescaleToWidth } from 'gh-client-base';
import { App } from '@/components/game/sources/App';
import { BuyBonus } from '@/components/bonus/sources/BuyBonus';
import { ResizeManager } from '@/components/game/sources/ResizeManager';
import { SizeConfig } from '@/utils/SizeConfig';
import { UIController } from '@/components/ui/sources/UIController';
import UIState from '@base/ui/sources/UIState';
import { RestoreManager } from '@/components/network/sources/RestoreManager';

export class BuyBonusPlate {
  private image: Sprite;
  private title: Text;

  constructor(onClick: () => void) {
    this.image = new Sprite(Texture.from('plateBB'));

    const { plate, plateTitle } = Assets.get<Record<string, ITextStyle>>('bonusTextStyles');

    this.title = new Text(` ${localize('buy_bonus').toUpperCase()} `, { ...plateTitle, wordWrap: true, wordWrapWidth: 200 });
    this.title.position.set(0, -30);
    this.title.anchor.set(0.5);
    rescaleToWidth(this.title, 160)

    const showBtn = new Button(
      'btn-normal',
      'btn-hover',
      'btn-pressed',
      'btn-disabled',
      onClick,
    );
    showBtn.setTitle(` ${App.$instance.quickActions.formatMoney(BuyBonus.amount)} `, plate, 130);
    showBtn.position.set(0, 35);

    this.image.addChild(this.title, showBtn);

    if (App.$instance.network.allowBuyBonus) {
      LayerManager.layers.get('reelset')?.addChild(this.image);
    }

    UIController.emitter.on('update', () => {
      if (UIState.buyBonus.disabled){// || RestoreManager.previousResult?.can_gamble) {
        showBtn.disable();
        Gsap.to(this.image, { alpha: 0.5, duration: 0.3, ease: 'power1.inOut' });
      } else {
        showBtn.enable();
        Gsap.to(this.image, { alpha: 1, duration: 0.3, ease: 'power1.inOut' });
      }

      this.image.visible = !UIState.doubleChance.hidden;
    });

    App.$instance.eventEmitter.on('update-bet', () => {
      showBtn.setTitle(` ${App.$instance.quickActions.formatMoney(BuyBonus.amount)} `, plate, 130);
    });

    App.$instance.eventEmitter.on('resize', () => {
      this.onResize();
    });
    this.onResize();
  }

  protected onResize(): void {
    if (ResizeManager.isPortrait) {
      const scale = Math.min(1.5, (SizeConfig.gameSize.width / window.innerWidth) / (window.innerHeight / SizeConfig.gameSize.height));

      this.image.anchor.set(0.5);
      this.image.position.set(-480, Math.max(550, SizeConfig.gameSize.height * 0.4));
      this.image.scale.set(scale);
    } else {
      this.image.anchor.set(0.5);
      this.image.position.set(-800, -80);
      this.image.scale.set(1);
    }
  }
}
