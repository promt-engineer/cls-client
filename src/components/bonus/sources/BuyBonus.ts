import { LayerManager } from '@base/game/sources/LayerManager';
import { Layer } from '@pixi/layers';
import { Assets, Container, HTMLText, ITextStyle, Sprite, Texture } from 'pixi.js';
import { Button, capitalize, Gsap, HtmlFontStyle, localize } from 'gh-client-base';
import { FSM } from '@base/fsm/sources/FSM';
import { App } from '@/components/game/sources/App';
import UIState from '@base/ui/sources/UIState';
import { UIController } from '@/components/ui/sources/UIController';

export class BuyBonus {
  protected layer: Layer;
  protected yesButton: Button;
  protected noButton: Button;
  protected text: HTMLText;
  protected closing = false;
  public static readonly coef = 100;

  protected container = new Container();

  constructor() {
    this.layer = LayerManager.layers.get('buy_bonus')!;

    this.createSelectMenu();

    this.layer.alpha = 0;
    this.layer.visible = false;

    App.$instance.eventEmitter.on('update-bet', (value: number) => {
      this.updateAmount();
    });

    UIController.emitter.on('update', () => {
      if (this.layer.visible && !UIState.buyBonus.active && !this.closing) {
        this.close();
      }
    })
  }

  public static get amount() {
    return App.$instance.network.bet * BuyBonus.coef;
  }

  createSelectMenu() {
    const container = new Container();

    this.firstOption(container);

    this.layer.addChild(container);
  }

  protected async updateAmount() {
    this.text.text = `${localize('are_you_sure')} $SUM?`.toUpperCase().replace('$SUM', `<span class="money-amount">${App.$instance.quickActions.formatMoney(BuyBonus.amount)}</span>`);
    await this.text.updateText();
  }

  async firstOption(container: Container) {
    const { textStyle } = Assets.get<Record<string, ITextStyle>>('bonusTextStyles');

    this.container.interactive = true;

    const background = new Sprite(Texture.from(`backgroundBB`));
    background.anchor.set(0.5);

    const newFontStyle = new HtmlFontStyle(textStyle);

    newFontStyle.stylesheet = `
    .money-amount {
      color: #ede134;
    }
    `;

    const title =
      `${localize('are_you_sure')} $SUM?`.toUpperCase().replace('$SUM', `<span class="money-amount">${App.$instance.quickActions.formatMoney(BuyBonus.amount)}</span>`);
    this.text = new HTMLText(title, newFontStyle);

    this.text.text = title;
    await this.text.updateText();

    this.text.anchor.set(0.5);
    this.text.y = -50;

    this.yesButton = new Button(
      'yes-btn-normal',
      'yes-btn-hover',
      'yes-btn-pressed',
      'yes-btn-disabled',
      () => {
        this.onConfirm();
        this.yesButton.eventMode = 'auto';
      },
    );
    this.yesButton.position.set(200, 180);
    this.yesButton.setTitle(capitalize(localize('bonus_popup_yes')), { ...textStyle, padding: 5 });

    this.noButton = new Button(
      'no-btn-normal',
      'no-btn-hover',
      'no-btn-pressed',
      'no-btn-disabled',
      () => {
        this.close();
      },
    );
    this.noButton.position.set(-200, 180);
    this.noButton.setTitle(capitalize(localize('bonus_popup_no')), { ...textStyle, padding: 5 });

    this.container.addChild(
      background,
      this.text,
      this.yesButton,
      this.noButton,
    );

    container.addChild(this.container);
  }

  show() {
    this.layer.visible = true;
    Gsap.to(this.layer, { alpha: 1, duration: 1, ease: 'power1.inOut' });

    UIState.showBuyBonus(true);
    UIController.emitter.emit('update');
  }

  async onConfirm() {
    UIState.enableSpin(true);
    FSM.$instance.setCurrentState('BuyBonusSpin');
    await this.close();
  }

  async close() {
    return new Promise((resolve) => {
      Gsap.to(this.layer, {
        alpha: 0,
        duration: 1,
        ease: 'power1.inOut',
        overwrite: true,
        onStart: () => {
          this.closing = true;
          this.yesButton.eventMode = 'auto';
          this.noButton.eventMode = 'auto';
          },
        onComplete: () => {
          this.layer.visible = false;

          if (!UIState.spin.active) {
            UIState.showBuyBonus(false);
          }
          UIController.emitter.emit('update');

          this.yesButton.eventMode = 'static';
          this.noButton.eventMode = 'static';

          this.closing = false;
        },
      });

      return resolve(1);
    });
  }
}
