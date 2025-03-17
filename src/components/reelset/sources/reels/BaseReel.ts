import { SymbolIndex } from '@/components/reelset/sources/enums';
import { SymbolView } from '@/components/reelset/sources/view/SymbolView';
import { ReelView as Base } from '@base/reelset/sources/view/ReelView';

export abstract class BaseReel extends Base {
  protected constructor(reelIndex?: number) {
    super(reelIndex ?? 0);
  }

  protected abstract buildReel(symbolIndexes: SymbolIndex[]): void;

  public abstract addNewSymbols(symbols: SymbolIndex[], data: SymbolIndex[]): any;

  protected createSymbol(symbolIndex: SymbolIndex): SymbolView {
    return new SymbolView(symbolIndex);
  }

  protected abstract buildSymbols(symbolIndexes: SymbolIndex[]): void;

  protected abstract addSymbol(symbolIndex: SymbolIndex, reelSize: number): void;
}
