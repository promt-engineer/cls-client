import { SymbolIndex } from '@/components/reelset/sources/enums';
import { RenderTexture, Sprite, Texture } from 'pixi.js';
import { SizeConfig } from '@/utils/SizeConfig';
import { getRandomElement } from 'gh-client-base';
import { SIZES } from '@/components/reelset/sources/view/ReelView';
import { BackgroundType } from '@/components/background/sources/Background';

export default class DummySymbol extends Sprite {
  public static readonly blurredSymbolTextures: Record<BackgroundType, Map<SymbolIndex, Map<number, RenderTexture>>> = { basic: new Map<SymbolIndex, Map<number, RenderTexture>>(), fs: new Map<SymbolIndex, Map<number, RenderTexture>>() };
  public static backgroundType: BackgroundType = 'basic';

  private static generateRandomData() {
    const symbolIndexes = Object.values(SymbolIndex).filter((item): item is SymbolIndex => typeof item === 'number' && item !== SymbolIndex.s11);
    const randomSymbolIndex = getRandomElement(symbolIndexes);
    const randomSize = getRandomElement(SIZES);

    return { randomSymbolIndex, randomSize };
  }

  private symbolIndex: SymbolIndex;
  private size: number;

  constructor(private readonly isHorizontal = false) {
    super();

    this.regenerate();

    this.anchor.set(0.5);
  }

  public regenerate(): void {
    const { randomSize, randomSymbolIndex } = DummySymbol.generateRandomData();

    const size = this.isHorizontal ? 3 : randomSize;

    this.symbolIndex = randomSymbolIndex;
    this.size = size;

    this.texture = this.getTexture();

    this.setScale();
  }

  private getTexture(): Texture {
    if (DummySymbol.backgroundType === 'fs') {
      const fsTexture = DummySymbol.blurredSymbolTextures.fs.get(this.symbolIndex)?.get(this.size);

      return fsTexture || DummySymbol.blurredSymbolTextures.basic.get(this.symbolIndex)?.get(this.size)!;
    }

    return DummySymbol.blurredSymbolTextures.basic.get(this.symbolIndex)?.get(this.size)!;
  }

  public get height(): number {
    return (SizeConfig.reelsHeight - SizeConfig.symbolIndentY * this.size) / (this.size + 1);
  }

  private setScale(): void {
    if (this.symbolIndex === 1 || this.symbolIndex === 4) {
      this.scale.set(0.5);
    } else {
      this.scale.set(1);
    }
  }
}
