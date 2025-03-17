import { Assets, Container, Sprite, Text, Texture } from 'pixi.js';
import { Gsap, GsapTween, localize, SpineAnimation } from 'gh-client-base';
import { SizeConfig } from '@/utils/SizeConfig';
import { App } from '@/components/game/sources/App';
import { LayerManager } from '@base/game/sources/LayerManager';

export default class Slider extends Container {
  public active = true;

  protected slidesNumber = 3;
  protected slides: SpineAnimation[] = [];
  protected crashAnimation = new SpineAnimation('slide_crash');
  protected dots: Sprite[] = [];
  protected dotsContainer = new Container();
  protected tween: GsapTween;
  protected activeDot = Texture.from('dot-active');
  protected normalDot = Texture.from('dot-normal');
  protected activeSlide = 0;
  protected slideTitle: Text;
  protected phrases: string[];
  protected logo = new Sprite(Texture.from('logo')); 
  private dy = 150;

  constructor() {
    super();

    this.position.set(0, -145);

    this.setSlides();
    this.setDots();
    this.setSlideTitle();

    this.start();

    App.$instance.eventEmitter.on('resize', () => {
      this.onResize();
    });

    this.addChild(this.logo)

    this.onResize();

  }

  protected setSlideTitle(): void {
    this.phrases = Assets.get<string[]>('phrases');

    this.slideTitle = new Text(
      localize(this.phrases[this.activeSlide] as Linguist.TextKeys).toUpperCase(),
      Assets.get('onboardingFontStyles').randomPhrase,
    );

    this.slideTitle.position.set(0, 440 + (SizeConfig.isLandscape? this.dy : 0));
    this.slideTitle.anchor.set(0.5);

    this.addChild(this.slideTitle);
  }

  public onHiddenOnboarding(): void {
    if (window.localStorage.getItem("showOnboarding") === 'true') {
      this.slideTitle.visible = false;
      this.slides.forEach(el => el.visible = false);
      this.dotsContainer.visible = false;
      this.crashAnimation.visible = false;
      this.logo.visible = false;
      return;
    }
  }

  public onResize(): void {
    if (!LayerManager.layers.get('onboarding')?.visible) return;

    if (SizeConfig.isLandscape) {
      this.slides.forEach((slide) => slide.scale.set(1));
      this.logo.position.set(-900, -390)
      this.dotsContainer.y = this.height / 2 - 55 + this.dy * 0.55;
	    this.slideTitle.position.set(0, 440 + this.dy);
      this.slides.forEach((slide) => slide.y = 116 + this.dy);
      this.crashAnimation.y = 116 + this.dy;
    } else {
      this.slides.forEach((slide) => slide.scale.set(0.9));
      this.logo.position.set(-500, -600)
      this.dotsContainer.y = this.height / 2 - 170;
      this.slideTitle.position.set(0, 440);
      this.slides.forEach((slide) => slide.y = 116);
      this.crashAnimation.y = 116;
    }

    this.slideTitle.style.wordWrap = true;
    this.slideTitle.style.wordWrapWidth = SizeConfig.gameSize.width;
  }

  protected setSlides(): void {
    for (let i = 1; i <= this.slidesNumber; i++) {
      const slide = new SpineAnimation(`slide-${i}`);
      slide.play('animation').pause();
      slide.y = 116 + (SizeConfig.isLandscape? this.dy : 0);
      this.slides.push(slide);
      this.addChild(slide);

      slide.alpha = i === 1 ? 1 : 0;
    }

    this.crashAnimation = new SpineAnimation('slide_crash');
    this.crashAnimation.y = 116 + (SizeConfig.isLandscape? this.dy : 0);
    this.addChild(this.crashAnimation);

    this.crashAnimation.play('all').pause();
  }

  protected setDots(): void {
    const height = this.height;

    for (let i = 0; i < this.slidesNumber; i++) {
      const dot = new Sprite(this.normalDot);
      dot.anchor.y = 0.5;
      dot.x = dot.width * i;

      dot.eventMode = 'static';
      dot.cursor = 'pointer';

      dot.on('pointerup', () => {
        if (this.activeSlide === i) return;

        this.tween.kill();
        // set active slide as slide before active for smooth change
        this.activeSlide = i === 0 ? this.slides.length - 1 : i - 1;
        this.start(0);
      });

      this.dots.push(dot);
      this.dotsContainer.addChild(dot);

      if (i === 0) {
        dot.texture = this.activeDot;
      }
    }

    this.dotsContainer.pivot.x = this.dotsContainer.width / 2;
    this.dotsContainer.y = height / 2 - 5;

    this.addChild(this.dotsContainer);
  }

  protected start(delay = 5): void {
    if (!this.active) return;

    if (this.activeSlide === 0) {
      this.crashAnimation.resume();
    }

    this.slides[this.activeSlide].resume();
    this.slideTitle.text = localize(this.phrases[this.activeSlide] as Linguist.TextKeys).toUpperCase();

    this.tween = Gsap.to(this.slides, {
      delay,
      duration: 0.5,
      ease: 'none',
      alpha: (_: number, target: SpineAnimation) => this.slides.indexOf(target) === (this.activeSlide + 1 === this.slides.length ? 0 : this.activeSlide + 1) ? 1 : 0,
      onComplete: () => {
        this.slides[this.activeSlide].play('animation').pause();
        if (this.activeSlide === 0) {
          this.crashAnimation.play('all').pause();
        }

        this.activeSlide++;

        if (this.activeSlide === this.slides.length) {
          this.activeSlide = 0;
        }

        this.dots.forEach((dot, index) => {
          dot.texture = index === this.activeSlide ? this.activeDot : this.normalDot;
        });

        this.start();
      },
    });
  }

  destroy() {
    this.active = false;
    this.tween.kill();

    super.destroy({ children: true });
  }
}
