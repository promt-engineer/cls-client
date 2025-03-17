import { Assets, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { LayerManager } from '@base/game/sources/LayerManager';
import { Layer } from '@pixi/layers';
import { rescaleToWidth } from 'gh-client-base';

export class LogoCounter {
  private counterArray?: number[][];

  private image?: Sprite;
  private counter: Text;
  private layer: Layer;

  public value = 1;

  constructor() {
    this.layer = LayerManager.layers.get('reelset')!;
    this.image = new Sprite(Texture.from(`backgroundMegaways`));
    this.image.anchor.set(0.5);
    this.image.position.set(555, -335);

    const style = new TextStyle(Assets.get('counterFontStyles').counter);

    this.counter = new Text('200704', style);
    this.counter.anchor.set(0.5);
    this.counter.y = 15

    this.image.addChild(this.counter);

    this.layer.addChild(this.image);
  }

  public init(counter: number[][]) {
    this.counterArray = counter;
    this.reset();
  }

  public reset(): void {
    this.counter.text = '';
    this.counter.anchor.set(0.5);
  }

  public updateText(index: number) {
    if (!this.counterArray) return console.error('counterArray is undefined');
    if (this.counterArray.length - 1 < index) return;

    this.value = 1;
    for (let i = 0; i <= index; i++) {
      this.value *= this.getSymbolsCountInLine(i);
    }

    this.counter.text = this.value.toString();

    if (this.counter.width > 200) {
      rescaleToWidth(this.counter, 200);
    }
  }

  private getSymbolsCountInLine(i: number) {
    return this.counterArray![i].length || 0;
  }
}
