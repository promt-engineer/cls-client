import { LayerManager } from '@base/game/sources/LayerManager';
import { Layer } from '@pixi/layers';
import { Container } from 'pixi.js';
import { Gsap, localize, setOrigin } from 'gh-client-base';
import { ChoiceSection } from '@/components/freespins/sources/view/ChoiceSection';
import { App } from '@/components/game/sources/App';
import { SizeConfig } from '@/utils/SizeConfig';

const MYSTERY_SECTION_INDEX = 3;

export class FreeSpinIntro {
  protected layer: Layer;
  protected endCallback: (() => void) | null = null;
  protected choiceSections: ChoiceSection[] = [];
  protected choices: Network.BonusChoice[] = [];

  constructor() {
    this.layer = LayerManager.layers.get('freespinIntro')!;
    this.layer.alpha = 0;
    this.layer.visible = false;

    this.createSelectMenu();

    App.$instance.eventEmitter.on('resize', () => {
      this.onResize();
    })

    this.onResize();
  }

  protected onResize(): void {
    if (!SizeConfig.isLandscape) {
      LayerManager.layers.get('freespinIntro')?.scale.set(0.8);
    } else {
      LayerManager.layers.get('freespinIntro')?.scale.set(1);
    }
  }

  createSelectMenu() {
    const container = new Container();
    const padding = 50;

    for (let i = 0; i < 4; i++) {
      const section = new ChoiceSection(i);
      section.x = (section.width + padding) * i;

      this.choiceSections.push(section);
      container.addChild(section);
    }

    setOrigin(container, 0.387, 0);

    this.layer.addChild(container);
  }

  protected async sendChoice(index: number) {
    const choice = this.choices[index];

    App.$instance.eventEmitter.emit('update-fs-multiplier', choice.multiplier, true);

    App.$instance.eventEmitter.emit('get-bonus-spin-data', await App.$instance.network.generateBonus(choice));

    if (index === 3) {
      await this.choiceSections[MYSTERY_SECTION_INDEX].mysteryChoice(choice);
    }

    App.$instance.soundController.play('freespin_start');

    this.close();
  }

  public initFSChoices(choice: Network.BonusChoice[]): void {
    this.choices = choice;

    choice.forEach(({ spins, multiplier }, index) => {
      const choiceFS = index !== 3
        ? `${spins}\n${localize('free_spins').toUpperCase()}`
        : localize('mystery').toUpperCase();
      const choiceMult = index !== 3
        ? `${localize('choice_starting_multiplier', true)}\n${multiplier}`
        : localize('mystery').toUpperCase();
      this.choiceSections[index].setChoiceText(choiceFS, choiceMult);
    });
  }

  play() {
    return new Promise<void>((resolve) => {
      this.endCallback = resolve;
      this.layer.visible = true;

      Gsap.to(this.layer, {
        alpha: 1,
        duration: 1,
        ease: 'power1.inOut',
        onComplete: () => {
          this.setHandlers();
        },
      });
    });
  }

  protected setHandlers(): void {
    this.choiceSections.forEach((section, index) => {
      section.setHandlers(index);
      section.once('choose', (index) => {
        App.$instance.soundController.play('choose_fs');

        this.removeHandlers();
        this.sendChoice(index);
      });
    });
  }

  protected removeHandlers(): void {
    this.choiceSections.forEach((section) => section.removeHandlers());
  }

  close() {
    Gsap.to(this.layer, {
      alpha: 0,
      duration: 1,
      ease: 'power1.inOut',
      onComplete: () => {
        this.layer.visible = false;
        this.endCallback!();

        this.endCallback = null;
      },
    });
  }
}
