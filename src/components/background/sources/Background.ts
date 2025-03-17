import { Assets, Sprite, Texture } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { Gsap, SpineAnimation } from 'gh-client-base';
import { App } from '@/components/game/sources/App';
import { SizeConfig } from '@/utils/SizeConfig';
import { ResizeManager } from '@/components/game/sources/ResizeManager';
import { MultiplierCounter } from '@/components/background/sources/MultiplierCounter';
import { ProviderLogo } from '@base/onboarding/sources/ProviderLogo';

export type BackgroundType = 'basic' | 'fs';

export class Background {
  protected background: SpineAnimation;
  protected fsBackground: SpineAnimation;
  protected mobileFsBackground: SpineAnimation;
  protected mobileBackground: SpineAnimation;
  protected providerLogo: ProviderLogo;

  protected currentType: BackgroundType = 'basic';

  protected reels: Sprite;
  protected multiplier: MultiplierCounter;

  constructor() {
    this.setMainBackground();
    this.setFsBackground();
    this.setReelsBackground();

    App.$instance.eventEmitter.on('resize', () => {
      this.onResize();
    });
    this.onResize();

    App.$instance.eventEmitter.on('set-new-state', (state: BackgroundType, quick?: boolean, withoutMusic?: boolean) => {
      if (!withoutMusic) {
        if (state === 'fs') {
          App.$instance.soundController.stop('back');
          App.$instance.soundController.play('back_fs');
        } else {
          App.$instance.soundController.stop('back_fs');
          App.$instance.soundController.play('back');
        }
      }

      this.transitionTo(state, quick);
    });
  }

  protected setFsBackground(): void {
    // todo: create mobile only if it's mobile device
    this.mobileFsBackground = new SpineAnimation('bg-mobile');
    this.mobileFsBackground.changeSkin('fs');
    this.mobileFsBackground.play('animation', { loop: true });

    this.fsBackground = new SpineAnimation('bg-desktop');
    this.fsBackground.changeSkin('fs');
    this.fsBackground.play('animation', { loop: true });
  }

  public transitionTo(type: BackgroundType, quick?: boolean): void {
    const baseBg = ResizeManager.isPortrait ? this.mobileBackground : this.background;
    const fsBg = ResizeManager.isPortrait ? this.mobileFsBackground : this.fsBackground;
    this.currentType = type;

    // todo: set the same animation time before transition?

    baseBg.cacheAsBitmap = type === 'fs';
    fsBg.cacheAsBitmap = type === 'basic';

    requestAnimationFrame(() => {
      if (quick) {
        (type === 'fs' ? this.multiplier : App.$instance.logo).alpha = 1;
        (type === 'fs' ? [App.$instance.logo, baseBg] : [this.multiplier, fsBg]).forEach((element) => element.alpha = 0);
        LayerManager.layers.get('background')?.addChildAt(type === 'fs' ? fsBg : baseBg, 0);
        LayerManager.layers.get('background')?.removeChild(type === 'fs' ? baseBg : fsBg);
        (type === 'fs' ? baseBg : fsBg).alpha = 1;

        baseBg.cacheAsBitmap = false;
        fsBg.cacheAsBitmap = false;

        return;
      }

      Gsap.to(type === 'fs' ? this.multiplier : App.$instance.logo, {
        alpha: 1,
        duration: 1,
      });

      Gsap.to(type === 'fs' ? [App.$instance.logo, baseBg] : [this.multiplier, fsBg], {
        duration: 1,
        alpha: 0,
        onStart: () => {
          LayerManager.layers.get('background')?.addChildAt(type === 'fs' ? fsBg : baseBg, 0);
        },
        onComplete: () => {
          LayerManager.layers.get('background')?.removeChild(type === 'fs' ? baseBg : fsBg);
          (type === 'fs' ? baseBg : fsBg).alpha = 1;

          baseBg.cacheAsBitmap = false;
          fsBg.cacheAsBitmap = false;
        },
      });
    });
  }

  protected setMainBackground(): void {
    // todo: create mobile only if it's mobile device
    this.mobileBackground = new SpineAnimation('bg-mobile');
    this.mobileBackground.changeSkin('basic');
    this.mobileBackground.play('animation', { loop: true });

    this.background = new SpineAnimation('bg-desktop');
    this.background.changeSkin('basic');
    this.background.play('animation', { loop: true });

    if(!ResizeManager.isPortrait){
      this.providerLogo = new ProviderLogo(Assets.get('providerLogoBaseConfig'));
      this.providerLogo.y += 70;
      LayerManager.layers.get('reelset')?.addChild(this.providerLogo);
    }
  }

  protected setReelsBackground(): void {
    this.reels = new Sprite(Texture.from('reel'));
    this.reels.anchor.set(0.5);

    this.multiplier = new MultiplierCounter();
    this.multiplier.anchor.set(0.5);
    this.multiplier.position.set(-555, -335);
    this.multiplier.alpha = 0;

    LayerManager.layers.get('reelset')?.addChild(this.reels, this.multiplier);
  }

  protected onResize(): void {
    // todo: fix problems with resizing during transition
    if (!SizeConfig.isLandscape) {
      LayerManager.layers.get('background')?.removeChild(this.fsBackground, this.background);
      LayerManager.layers.get('background')?.addChild(this.currentType === 'fs' ? this.mobileFsBackground : this.mobileBackground);

      if (ResizeManager.portraitMode === 1) {
        this.mobileBackground.scale.set(SizeConfig.gameSize.height / SizeConfig.initBackgroundHeight);
        this.mobileFsBackground.scale.set(SizeConfig.gameSize.height / SizeConfig.initBackgroundHeight);
      } else {
        this.mobileBackground.scale.set(1.01);
        this.mobileFsBackground.scale.set(1.01);
      }
    } else {
      LayerManager.layers.get('background')?.removeChild(this.mobileFsBackground, this.mobileBackground);
      LayerManager.layers.get('background')?.addChild(this.currentType === 'fs' ? this.fsBackground : this.background);
    }
  }
}
