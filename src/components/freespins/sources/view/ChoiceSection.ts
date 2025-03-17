import { Assets, Container, ITextStyle, Sprite, Text, Texture } from 'pixi.js';
import { Gsap, localize, rescaleToWidth } from 'gh-client-base';

export class ChoiceSection extends Container {
  protected sectionTextStyle: ITextStyle;
  protected fsFontStyle: ITextStyle;
  protected textAmount: Text;
  protected textMultiplier: Text;
  protected multText: Text;
  protected background: Sprite;

  constructor(index: number) {
    super();

    const {
      fsChoice,
      [`choice${index + 1}`]: fsFontStyle,
    } = Assets.get<Record<string, ITextStyle>>('fsTextStyles');

    this.sectionTextStyle = fsChoice;
    this.fsFontStyle = fsFontStyle;

    this.createSection();
  }

  protected createSection() {
    this.background = new Sprite(Texture.from(`fsPrize-button-normal`));
    this.background.anchor.set(0.5);

    const multiplier = new Sprite(Texture.from(`multiplier-prize`));
    multiplier.anchor.set(0.5);
    multiplier.position.set(this.background.x, this.background.y);

    this.textAmount = new Text('', this.sectionTextStyle);
    this.textAmount.position.set(this.background.x, -300);
    this.textAmount.anchor.set(0.5);

    this.multText = new Text(localize('choice_mutiplier_text', true), this.fsFontStyle);
    this.multText.position.set(this.background.x, this.background.y);
    this.multText.anchor.set(0.5);

    this.textMultiplier = new Text('', this.sectionTextStyle);
    this.textMultiplier.position.set(this.background.x, 270);
    this.textMultiplier.anchor.set(0.5);

    this.addChild(
      this.background,
      multiplier,
      this.textAmount,
      this.multText,
      this.textMultiplier,
    );
  }

  public setChoiceText(choiceFS: string, choiceMult: string): void {
    this.textAmount.text = choiceFS;
    rescaleToWidth(this.textAmount, 300);
    this.textMultiplier.text = choiceMult;
    rescaleToWidth(this.textMultiplier, 300);
  }

  public async mysteryChoice(data: Network.BonusChoice) {
    await Gsap.to([this.textAmount, this.textMultiplier], {
      keyframes: [
        {
          alpha: 0,
          duration: 1,
          onComplete: () => {
            this.textAmount.text = `${data.spins}\n${localize('free_spins').toUpperCase()}`;
            rescaleToWidth(this.textAmount, 300);
            this.textMultiplier.text = `${localize('choice_starting_multiplier', true)}\n${data.multiplier}X`;
            rescaleToWidth(this.textMultiplier, 300);
          },
        },
        {
          alpha: 1,
          duration: 1,
          ease: 'power1.in',
        },
        {
          duration: 1,
        },
      ],
    });
  }

  public setHandlers(index: number) {
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerdown', () => {
      this.background.texture = Texture.from('fsPrize-button-pressed');
    });
    this.once('pointerup', () => {
      this.emit('choose', index);
      this.background.texture = Texture.from('fsPrize-button-normal');
    });
    this.on('mouseover', () => {
      this.background.texture = Texture.from('fsPrize-button-hover');
    });
    this.on('mouseout', () => {
      this.background.texture = Texture.from('fsPrize-button-normal');
    });
  }

  public removeHandlers(): void {
    this.eventMode = 'auto';
    this.cursor = 'auto';

    this.off('pointerdown');
    this.off('pointerup');
    this.off('mouseout');
    this.off('mouseover');
    this.off('choose');
  }
}
