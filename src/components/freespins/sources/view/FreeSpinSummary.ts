import { LayerManager } from '@base/game/sources/LayerManager';
import { Layer } from '@pixi/layers';
import { Assets, Container, ITextStyle, Text } from 'pixi.js';
import { Gsap, GsapTween, localize, rescaleToWidth, SpineAnimation } from 'gh-client-base';
import { App } from '@/components/game/sources/App';

export class FreeSpinSummary {
  protected layer: Layer;
  protected winText!: Text;
  protected popup = new SpineAnimation('fs-summary-popup');
  protected fsNumber: Text;
  protected helpPage = document.querySelector<HTMLDivElement>('.help-page')!;
  protected counter: GsapTween;

  constructor() {
    this.layer = LayerManager.layers.get('freespinOutro')!;

    this.layer.visible = false;
    this.layer.addChild(this.popup);

    this.addText();
  }

  protected addText(): void {
    const {
      lowerText,
      mainText,
      counterText,
    } = Assets.get<Record<string, ITextStyle>>('fsTextStyles');

    this.winText = new Text(App.$instance.quickActions.formatMoney(0), counterText);
    this.winText.anchor.set(0.5, 0.65);
    this.winText.x += 10;

    const congrats = new Text(` ${localize('fs_congratulations')} `.toUpperCase(), mainText);
    congrats.x += 10;
    congrats.anchor.set(0.5);
    this.popup.attachToSlot('CONGRATULATIONS!', congrats);

    const youHaveWon = new Text(localize('fs_you_won').toUpperCase(), lowerText);
    youHaveWon.anchor.set(0.475, 0.7);
    this.popup.attachToSlot('YOU HAVE WON', youHaveWon);

    const container = new Container();

    const inText = new Text(localize('fs_in').toUpperCase(), lowerText);
    inText.anchor.set(0, 0.9);
    container.addChild(inText);

    this.fsNumber = new Text('10', lowerText);
    this.fsNumber.anchor.set(0, 0.9);
    this.fsNumber.x = inText.x + inText.width + 10;
    container.addChild(this.fsNumber);

    const freeSpins = new Text(localize('free_spins_summary', true), lowerText);
    freeSpins.x = this.fsNumber.x + this.fsNumber.width + 30;
    freeSpins.anchor.set(0, 0.9);
    container.addChild(freeSpins);

    container.pivot.x = container.width * 0.49;
    rescaleToWidth(container, 820);

    this.popup.attachToSlot('IN', container);

    const text = new Text(localize('press_anywhere').toUpperCase(), { ...lowerText, fontSize: 50 });
    text.anchor.set(0.5, 0.9);
    rescaleToWidth(text, 900);

    this.popup.attachToSlot('press', text);
  }

  play(win: number, fsNumber: number) {
    return new Promise<void>((resolve) => {
      this.popup.attachToSlot('123.45$', this.winText);
      this.fsNumber.text = ` ${fsNumber} `;
      this.layer.visible = true;

      this.popup.play('in').once('complete', () => {
        this.winText.text = App.$instance.quickActions.formatMoney(0);
        const target = {
          value: 0,
        };

        this.popup.play('loop', { loop: true });

        const onComplete = () => {
          this.popup.eventMode = 'static';
          this.popup.cursor = 'pointer';

          const eventSpace = (event: KeyboardEvent) => {
            if(event.code === "Space") {
              onClick();
            }
          };

          const eventClick = (event: PointerEvent) => {
            // todo: check using stopPropagation for clicking on help page
            if (event.composedPath().includes(this.helpPage)) {
              return;
            }
            onClick();
          };

          const onClick = () => {
            this.winText.text = App.$instance.quickActions.formatMoney(win);

            if (this.winText.width > 850) {
              rescaleToWidth(this.winText, 850);
            }

            document.body.removeEventListener('pointerdown', eventClick);
            document.body.removeEventListener('keydown', eventSpace);

            App.$instance.soundController.play('freespin_end');

            this.popup.play('out').once('complete', () => {
              this.layer.visible = false;

              resolve();
            });
          };

          document.body.addEventListener('pointerdown', eventClick);
          document.body.addEventListener('keydown', eventSpace);
        };

        if (win !== 0) {
          const eventSpace = (event: KeyboardEvent) => {
            if(event.code === "Space") {
              completeTween();
            }
          };

          const eventClick = (event: PointerEvent) => {
            if (event.composedPath().includes(this.helpPage)) {
              return;
            }
            completeTween();
          };

          const completeTween = () => {
            this.counter.progress(1);
            document.body.removeEventListener('keydown', eventSpace);
            document.body.removeEventListener('pointerdown', eventClick);
          };

          this.counter = Gsap.to(target, {
            value: win,
            duration: 1,
            onStart: () => {
              document.body.addEventListener('keydown', eventSpace);
              document.body.addEventListener('pointerdown', eventClick);
            },
            onUpdate: () => {
              this.winText.text = App.$instance.quickActions.formatMoney(target.value);

              if (this.winText.width > 850) {
                rescaleToWidth(this.winText, 850);
              }
            },
            onComplete: () => {
              document.body.removeEventListener('keydown', eventSpace);
              document.body.removeEventListener('pointerdown', eventClick);

              this.counter.kill();

              onComplete();
            },
          });
        } else {
          onComplete();
        }
      });
    });
  }
}
