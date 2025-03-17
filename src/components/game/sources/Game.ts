import { BuyBonus } from '@/components/bonus/sources/BuyBonus';
import { BuyBonusPlate } from '@/components/bonus/sources/BuyBonusPlate';
import { cheats } from 'gh-client-base';
import { App } from '@/components/game/sources/App';
import { DoubleChance } from '@/components/double-chance/sources/DoubleChance';
import { Game as Base } from '@base/game/sources/Game';
import { symbolName } from '@/components/reelset/sources/enums';
import BetPanelWagers from '@base/ui/sources/elements/BetWagersPanel';

const REEL = 
[
  [4, 3, 2, 8, 5, 10, 7, 8, 7, 3, 7, 4, 5, 3, 8, 1, 2, 8, 10, 10, 6, 6, 2, 8, 8, 10, 7, 6, 9, 7, 5, 9, 6, 10, 8, 10, 4, 5, 10, 10, 8, 6, 9, 9, 8, 5, 9, 9, 8, 4, 5, 9, 9, 9, 6, 6, 5, 10, 9, 9, 4, 9, 8, 10, 9, 10, 5, 9, 10, 4, 11, 8, 3, 10, 10, 10, 9, 10, 9, 8, 8, 10, 6, 8, 3, 7, 11, 7, 5, 9],
  [7, 8, 4, 8, 12, 8, 8, 9, 6, 8, 2, 3, 6, 6, 8, 4, 6, 8, 9, 9, 9, 6, 10, 9, 9, 12, 6, 9, 9, 9, 10, 10, 6, 7, 1, 10, 6, 7, 10, 6, 10, 9, 10, 10, 9, 12, 7, 9, 5, 7, 10, 9, 2, 2, 9, 8, 10, 8, 7, 10, 5, 10, 8, 10, 4, 10, 10, 7, 8, 9, 2, 3, 8, 10, 3, 10, 12, 3, 4, 8, 5, 5, 4, 5, 10, 10, 5, 8, 5, 9, 8, 8, 3, 5, 8, 8, 7, 7],
  [9, 3, 9, 10, 10, 12, 8, 10, 10, 10, 2, 9, 10, 10, 10, 5, 8, 6, 9, 4, 7, 8, 12, 8, 8, 8, 9, 9, 5, 7, 5, 8, 5, 8, 9, 8, 3, 7, 9, 3, 6, 7, 6, 9, 7, 9, 6, 1, 6, 7, 8, 3, 4, 9, 8, 8, 12, 9, 7, 4, 2, 2, 4, 4, 9, 7, 3, 6, 5, 8, 6, 10, 10, 3, 8, 8, 5, 8, 5, 10, 10, 10, 10, 5, 10, 6, 10],
  [9, 8, 2, 8, 5, 12, 9, 3, 9, 9, 6, 10, 6, 5, 5, 4, 8, 5, 8, 7, 5, 7, 7, 7, 9, 12, 3, 5, 2, 9, 8, 10, 4, 7, 9, 5, 9, 9, 10, 10, 4, 12, 7, 8, 4, 10, 9, 6, 9, 8, 10, 5, 3, 8, 5, 10, 10, 10, 3, 10, 8, 10, 10, 2, 10, 4, 9, 9, 8, 8, 3, 4, 12, 8, 6, 8, 10, 6, 10, 3, 7, 1, 10, 9, 6, 9, 6, 7, 8],
  [7, 9, 7, 5, 6, 2, 8, 5, 3, 9, 10, 10, 6, 10, 5, 2, 10, 4, 8, 8, 6, 3, 10, 8, 10, 6, 8, 1, 10, 5, 6, 3, 6, 5, 4, 12, 5, 2, 8, 7, 10, 8, 8, 5, 10, 10, 9, 9, 9, 8, 9, 3, 6, 7, 8, 9, 12, 8, 6, 7, 9, 9, 5, 8, 4, 4, 2, 10, 4, 9, 8, 9, 8, 10, 9, 4, 7, 10, 3, 9, 3, 8, 9, 5, 12, 10, 8, 8, 9, 7, 9, 8, 10, 7],
  [6, 12, 4, 5, 6, 3, 10, 8, 1, 2, 5, 5, 3, 9, 9, 9, 3, 5, 7, 9, 9, 9, 8, 7, 10, 4, 10, 9, 2, 9, 6, 8, 10, 10, 6, 6, 3, 8, 7, 9, 4, 8, 7, 8, 10, 3, 7, 12, 9, 8, 6, 10, 8, 8, 4, 8, 8, 6, 2, 8, 7, 10, 8, 9, 7, 9, 5, 4, 2, 5, 9, 12, 10, 10, 9, 5, 3, 7, 10, 10, 9, 10, 8, 7, 4, 10, 8, 9],
  [8, 9, 12, 10, 3, 10, 9, 9, 8, 1, 8, 9, 10, 8, 5, 4, 8, 9, 10, 10, 2, 12, 10, 8, 8, 7, 7, 4, 5, 4, 8, 8, 7, 10, 10, 7, 9, 4, 6, 5, 8, 9, 5, 3, 10, 4, 10, 10, 9, 8, 9, 8, 5, 2, 5, 9, 6, 9, 9, 10, 9, 8, 9, 8, 3, 9, 6, 7, 3, 6, 10, 7, 5, 9, 10, 9, 9, 12, 10, 10, 7, 2, 3, 3, 8, 10, 8, 4, 8, 10, 6, 9, 6, 6],
];

export class Game extends Base {
  protected buyBonus: BuyBonus;
  protected plateBonus: BuyBonusPlate;
  protected doubleChance: DoubleChance;

  constructor() {
    super();
    new BetPanelWagers();
  }

  protected async initializeComponents(): Promise<void> {
    this.buyBonus = new BuyBonus();
    this.plateBonus = new BuyBonusPlate(() => this.buyBonus.show());
    this.doubleChance = new DoubleChance();

    if (cheats) {
      const selected_indexes = [0, 0, 0, 0, 0, 0, 0];
      let selected_reel_type = 0;
      let elem = document.getElementById("cheats_container")!;
      const main_reels_block = document.createElement("div");
      main_reels_block.style.display = "none";

      elem.appendChild(main_reels_block);
      
      const data = elem.children; 
      let isVisible = false;
      
      data[1].addEventListener("click", () => {
        isVisible = !isVisible;
        main_reels_block.style.display = isVisible ? "block" : "none";
      });
      
      for (let i = 0; i < 7; i++) {
        const select_block = document.createElement("select");
        select_block.size = 10;
        main_reels_block.appendChild(select_block);
        const current_reel_data = REEL[i];
        for (let j = 0; j < current_reel_data.length; j++) {
            const option = document.createElement("option");
            option.value = `${j}`;
            option.innerHTML = symbolName[current_reel_data[j] - 1].toString();
            select_block.options.add(option);
        }
    
        select_block.onchange = (e: any) => {
            selected_indexes[i] = parseInt(e.target.value);
            selected_reel_type = 0;
        };
        select_block.selectedIndex = 0;
      }

      cheats.addButton('FreeSpins', () => {
        App.$instance.network.sendCheat('freeGame');
      });

      cheats.addButton('RareFreeSpins', () => {
        App.$instance.network.sendCheat('rareFreeGame');
      });

      cheats.addButton('Order_Big_Win', () => {
        App.$instance.network.sendCheat('bigWin');
      });
      cheats.addButton('Gamble_Black', () => {
        App.$instance.network.sendCheat('gambleBlack');
      });
      cheats.addButton('Gamble_Red', () => {
        App.$instance.network.sendCheat('gambleRed');
      });
      cheats.addButton('select_combination', () => {
        App.$instance.network.sendCheat('any', selected_indexes);
      });
    }

    await super.initializeComponents();
  }
}
