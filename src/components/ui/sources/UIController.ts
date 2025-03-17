import { UIController as Base } from '@base/ui/sources/UIController';
import { getScattersTable, getWords } from '@/utils/Linguist';
import History from '@/components/ui/sources/settings/History'; 
import { localize } from 'gh-client-base';

export class UIController extends Base {
  protected history: History;
  constructor() {
    super(getWords());
    this.history = new History(document.querySelector('.help-page__section.history')!);

  }

  protected setScattersTable(): void {
    const words = getScattersTable();

    this.gameUi
      .querySelectorAll<HTMLDivElement>('.section__scatters-table div')
      .forEach((el, columnIndex) => {
        el.querySelectorAll('span').forEach((item, index) => {
          item.textContent = words[columnIndex][index];
        });
      });
  }

  public setTexts(words: Record<string, string>): void {
    super.setTexts(words);

    this.setScattersTable();
  }

  protected setHowToPlay(element: HTMLParagraphElement): void {
    const basePath = 'src/public/images';

    const imagePath = {
      $spin: `${basePath}/spin/spin_off_normal.png`,
      $bet: `${basePath}/bet/bet_normal.png`,
      $turbo: `${basePath}/turbo/turbo_off_normal.png`,
      $sound: `${basePath}/sound_on/sound_on_normal.png`,
      $fullscreen: `${basePath}/fullscreen/fullscreen_off_normal.png`,
      $menu: `${basePath}/menu/menu_normal.png`,
      $autoplay: `${basePath}/autospin/autospin_off_normal.png`,
      $stop: `${basePath}/autospin/autospin_on_normal.png`,
      $decrease: `${basePath}/betPopup/minus/minus_normal.png`,
      $increase: `${basePath}/betPopup/plus/plus_normal.png`,
      $tenAutoplay: `${basePath}/help-page/ten-autoplay.png`,
      $spinNumber: `${basePath}/help-page/spin-number.png`,
    };

    const text = localize('info.how_to_play_description.0', true) +
      '<br>' +
      localize('info.how_to_play_description.1', true) +
      '<br>' +
      localize('info.how_to_play_description.2', true) +
      '<br>' +
      localize('info.how_to_play_description.3', true) +
      '<br>' +
      localize('info.how_to_play_description.4', true) +
      localize('info.how_to_play_description.5', true) +
      '<br>' +
      localize('info.how_to_play_description.6', true) +
      '<br>' +
      localize('info.how_to_play_description.7', true);

    const formattedText = Object.entries(imagePath).reduce((description, [key, path]) => {
      return description.replace(key, `<img class="${key === '$tenAutoplay' ? 'ten-autoplay' : ''}" src="${path}" alt="${key}">`);
    }, text);

    element.innerHTML = formattedText;
  }
}
