import { App } from '@/components/game/sources/App';
import { localize } from 'gh-client-base';
import { Info as Base } from '@base/ui/sources/settings/Info';
import { ECL } from 'ecl';

// todo: need to update namings
enum InfoPage {
  Paytable = 'paytable',
  Paytable2 = 'paytable2',
  FsRules = 'fsRules',
  FsRules2 = 'fsRules2',
  GameFeatures = 'gameFeatures',
  GeneralFeatures = 'generalRules',
  GameRules = 'gameRules',
  HowToPlay = 'howToPlay'
}

const coefficients = [
  [50, 25, 10, 2, 1],
  [5, 2.5, 2, 1],
  [2.5, 1, 0.5, 0.3],
  [2, 0.8, 0.5, 0.3],
  [1.5, 0.6, 0.4, 0.2],
  [1.5, 0.6, 0.4, 0.2],
  [1.5, 0.6, 0.4, 0.2],
  [1, 0.4, 0.2, 0.1],
  [1, 0.4, 0.2, 0.1],
  [1, 0.4, 0.2, 0.1],
];

const counters = [6, 5, 4, 3, 2];

const pages = [InfoPage.Paytable, InfoPage.Paytable2, InfoPage.FsRules, InfoPage.FsRules2, InfoPage.GameFeatures, InfoPage.GeneralFeatures, InfoPage.GameRules, InfoPage.HowToPlay];

export default class Info extends Base {
  constructor(container: HTMLDivElement) {
    super(container, pages);
  }

  protected addWildDescription(element: HTMLDivElement): void {
    element.textContent = localize('info.wild_description', true);
  }

  protected addScatterDescription(element: HTMLDivElement): void {
    element.textContent = localize('info.scatter_description', true);
  }

  protected fillPaytable(): void {
    const rowElements = this.container.querySelectorAll<HTMLDivElement>('.symbols')!;
    const elements: HTMLDivElement[] = [];
    rowElements.forEach((item) => {
      item.querySelectorAll<HTMLDivElement>('.table')!.forEach((el) => {
        elements.push(el);
      });
    });

    let maxLength = 0;

    elements.forEach((element, index) => {
      if (index === 10) {
        this.addWildDescription(element);
        return;
      }

      if (index === 11) {
        this.addScatterDescription(element);
        return;
      }

      element.querySelectorAll<HTMLSpanElement>('span')!.forEach((item, coefIndex) => {
        // const amount = ECL.fmt.money(coefficients[index] ? coefficients[index][coefIndex]: 0 * App.$instance.network.bet, 0);
        const amount = ECL.fmt.money(coefficients[index][coefIndex] * App.$instance.network.bet, 0);

        if (maxLength < amount.length) {
          maxLength = amount.length;
        }

        item.outerHTML = `<span><b>${counters[coefIndex]}</b> - ${amount}</span>`;
      });
    });


    elements.forEach((element, index) => {
      element.style.fontSize = `calc(var(--game-ui-percent) * ${Math.min(1.2, 1 / maxLength * 12)})`;
    });
  }

  protected setImages(): void {
    const images = this.container.querySelectorAll<HTMLImageElement>('.image');

    for (let i = 0; i < 12; i++) {
      images[i].src = App.$instance.renderer.extract.canvas(App.$instance.loader.symbolTextures.get(i + 1)).toDataURL!('image/png');
    }
  }
}
