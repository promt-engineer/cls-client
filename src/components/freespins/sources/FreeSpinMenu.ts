import { LayerManager } from '@base/game/sources/LayerManager';
import { FreeSpinIntro } from './view/FreeSpinIntro';
import { FreeSpinSummary } from './view/FreeSpinSummary';
import { Layer } from '@pixi/layers';
import { Gsap } from 'gh-client-base';
import { App } from '@/components/game/sources/App';
import { BackgroundType } from '@/components/background/sources/Background';
import { UIController } from '@/components/ui/sources/UIController';
import UIState from '@base/ui/sources/UIState';

export class FreeSpinMenu {
  protected reelset = LayerManager.layers.get('reelset')!;
  protected intro = new FreeSpinIntro();
  protected summary = new FreeSpinSummary();

  constructor() {
  }

  public initFSChoices(data: Network.BonusChoice[]): void {
    this.intro.initFSChoices(data);
  }

  public async startFreeSpins() {
    UIController.emitter.emit('show-right-side', false);

    App.$instance.soundController.play('fs_choice_popup');

    await this.setVisible(this.reelset, false);

    await this.intro.play();

    UIController.emitter.emit('show-right-side', true);

    await this.setVisible(this.reelset, true, 'fs');
  }

  public async restoreFreeSpins(): Promise<void> {
    await this.setVisible(this.reelset, false);
    await this.setVisible(this.reelset, true, 'fs');
  }

  public async startSummary(win: number, fsNumber: number) {
    App.$instance.soundController.play('total_win_popup');

    await this.summary.play(win, fsNumber);

    await this.setVisible(this.reelset, true, 'basic');
  }

  protected setVisible(layer: Layer, value: boolean, newState?: BackgroundType) {
    return Gsap.to(layer, {
      alpha: Number(value),
      duration: 2,
      ease: 'power1.inOut',
      onStart: () => {
        if (newState) {
          App.$instance.eventEmitter.emit('set-new-state', newState)
          App.$instance.eventEmitter.emit('show-autospin-number', newState === 'basic');

          UIState.doubleChance.hidden = newState === 'fs';
          UIState.buyBonus.hidden = newState === 'fs';

          UIController.emitter.emit('update');

          if (newState === 'basic') {
            App.$instance.eventEmitter.emit('show-fs-left', false);
            App.$instance.eventEmitter.emit('update-fs-left', '');
          }
        }
      },
    });
  }
}
