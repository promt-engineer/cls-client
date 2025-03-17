import { App } from '@/components/game/sources/App';
import { LOW_SYMBOLS } from '@/components/reelset/sources/view/SymbolView';
import { localize } from 'gh-client-base';
import { SpineAnimation } from 'gh-client-base';

export default class Info {
    gameDataTitle = localize('history_game_data_title', true);
    gameDataText = [
        localize('history_game_data_1', true),
        localize('history_game_data_2', true),
        localize('history_game_data_3', true),
    ];
    transactionsTitle = localize('history_transaction_title', true);
    freeSpinsTransactionsTitle = localize('history_fs_transaction_title', true);
    transactionsText = [
        localize('history_transaction_1', true),
        localize('history_transaction_2', true),
        localize('history_transaction_3', true),
        localize('history_transaction_4', true),
    ];
    protected currentPageNumber = 1;
    protected currentReelNumber = 0;
    protected pageElement: HTMLSpanElement;
    protected arrowsElement: HTMLDivElement;
    protected leftArrow: HTMLButtonElement;
    protected rightArrow: HTMLButtonElement;

    protected leftReelArrow: HTMLButtonElement;
    protected rightReelArrow: HTMLButtonElement;

    protected loading: HTMLDivElement;
    protected noHistory: HTMLDivElement;
    protected freeSpinText: HTMLDivElement;
    protected content: HTMLDivElement;

    protected transactionElements: HTMLDivElement;
    protected gameDataElements: HTMLDivElement;
    protected reels: HTMLDivElement;
    protected arrowsReelsElement: HTMLDivElement;

    flattenHistory: (Network.IHistorySpin | Network.IHistorySpinBonus)[] = [];

    totalSpinscount = 0;
    bonusSpinsCounter = 0;

    currentSpinIndex = 0;
    lastPage = 1;
    totalPagesLoaded = 1;
    totalSpins = 0;
    currentPage = 1;
    historyCount = 5;

    historyIsLoading = true;

    public get currentHistorySpin(): (Network.IHistorySpin | Network.IHistorySpinBonus) {
        return this.flattenHistory[this.currentSpinIndex];
    }

    constructor(private container: HTMLDivElement) {
        this.pageElement = this.container.querySelector('.page')!;
        this.pageElement.textContent = localize('history_spins', true);
        const arrowElements = this.container.querySelectorAll('.arrows');
        this.arrowsElement = arrowElements[1] as HTMLDivElement;

        this.arrowsReelsElement = this.container.querySelector('.history__arrows-reels')!;

        this.transactionElements = this.container.querySelector('.history__transaction')!;
        this.gameDataElements = this.container.querySelector('.history__game-data')!;

        this.content = this.container.querySelector('.history__content')!;
        this.content.style.display = 'none';
        
        const title = this.container.querySelector('.title-history')!;
        title.textContent = localize('history_title', true);

        this.loading = this.container.querySelector('.history__loading')!;
        this.loading.textContent = localize('history_loading', true);

        this.noHistory = this.container.querySelector('.history__no-history')!;
        this.noHistory.textContent = localize('history_no_history', true);
        this.noHistory.style.display = 'none';

        this.freeSpinText = this.container.querySelector('.history__free-spins')!;
        this.freeSpinText.textContent = '';//localize('history_fs', true);
        this.freeSpinText.style.display = 'none';

        this.reels = this.container.querySelector('.history__reels')!;


        this.setTexts();
        this.onArrowClick();
        this.onArrowReelsClick();

        document.querySelector('.help-page .buttons .history')!.addEventListener('click', () => {
            this.initHistory();
        });
    }

    protected async initHistory() {
        this.currentPage = 1;
        this.currentSpinIndex = 0;
        this.flattenHistory = [];
        this.hide_data();
        this.loadHistory(this.currentPage);
    }

    loadHistory = async (page: number) => {
        this.historyIsLoading = true;

        const history = await App.$instance.network.getHistory(page, this.historyCount);
        console.log('history: ', history);
        this.historyIsLoading = false;

        if (history.data.records && history.data.records.length !== 0) {
            this.totalSpins = history.data.total;
            this.lastPage = Math.ceil(this.totalSpins / this.historyCount);
            this.totalPagesLoaded++;

            history.data.records.forEach(record => {
                record.fs = false;
                if (record.spin.bonus) {
                    let bonusSpins: Network.IHistorySpinBonus[] = [];

                    record.spin.bonus.spins.forEach(spin => {
                        bonusSpins.push(
                            {
                                start_balance: record.start_balance,
                                wager: record.wager,
                                end_balance: record.end_balance,
                                base_award: spin.award,
                                created_at: record.created_at,
                                updated_at: record.updated_at,
                                id: record.id,
                                transaction_id: record.transaction_id,
                                spin: spin,
                                fs: true
                            } as Network.IHistorySpinBonus,
                        );
                    })
                    this.saveLoadedHistory(bonusSpins.reverse());
                }
                this.saveLoadedHistory([record]);
            })
            this.updateSlotMachine();
        } else {
            this.noHistory.style.display = 'block';
            this.loading.style.display = 'none';
            return;
        }
    };

    hide_data = () => {
        this.content.style.display = 'none';
        this.reels.style.display = 'none';
        this.loading.style.display = 'block';
        this.noHistory.style.display = 'none';
        this.freeSpinText.style.display = 'none';
    }

    updateSlotMachine = () => {
        if (!this.currentHistorySpin.fs) {
            this.freeSpinText.style.display = 'none';
            this.content.style.display = 'block';
        }

        this.currentReelNumber = 0;
        this.noHistory.style.display = 'none';
        this.loading.style.display = 'none';
        if (this.currentHistorySpin.spin.avalanches.length > 1) {
            this.rightReelArrow.disabled = false;
        } else {
            this.rightReelArrow.disabled = true;
        }
        this.leftReelArrow.disabled = true;
        this.createReels();

        this.updateButtons();

        const transactionElements =
            this.transactionElements.querySelectorAll<HTMLDivElement>('.history__info-right')!;

        transactionElements[0].textContent = App.$instance.quickActions.formatMoney(
            this.currentHistorySpin.start_balance,
        );
        transactionElements[1].textContent = App.$instance.quickActions.formatMoney(
            this.currentHistorySpin.wager,
        );
        transactionElements[2].textContent = App.$instance.quickActions.formatMoney(
            this.currentHistorySpin.end_balance,
        );
        transactionElements[3].textContent = App.$instance.quickActions.formatMoney(
            this.currentHistorySpin.base_award,
        );

        const gameDataElements =
            this.gameDataElements.querySelectorAll<HTMLDivElement>('.history__info-right')!;
        gameDataElements[0].innerHTML =
            'Start: ' +
            this.formatDateTime(this.currentHistorySpin.created_at) +
            '<br>End: ' +
            this.formatDateTime(this.currentHistorySpin.updated_at);
        gameDataElements[1].innerHTML = this.currentHistorySpin.id;
        gameDataElements[2].innerHTML = this.currentHistorySpin.transaction_id;
        
        this.transactionElements.querySelector<HTMLDivElement>(
            '.history__info-title',
        )!.textContent = this.currentHistorySpin.fs? this.freeSpinsTransactionsTitle : this.transactionsTitle;

    }

    saveLoadedHistory = (historyResult: (Network.IHistorySpin | Network.IHistorySpinBonus)[]) => {
        this.flattenHistory.push(...historyResult);
    };

    updateButtons = () => {
        if (
            (this.currentSpinIndex + 1 >= this.flattenHistory.length &&
                this.lastPage <= this.currentPage) ||
            this.historyIsLoading
        ) {
            this.rightArrow.disabled = true;
        } else {
            this.rightArrow.disabled = false;
        }

        if (this.currentSpinIndex <= 0 || this.historyIsLoading) {
            this.leftArrow.disabled = true;
        } else {
            this.leftArrow.disabled = false;
        }
    };

    protected onArrowClick(): void {
        this.leftArrow = this.arrowsElement.querySelector<HTMLButtonElement>('.left')!;
        this.rightArrow = this.arrowsElement.querySelector<HTMLButtonElement>('.right')!;
        this.rightArrow.disabled = true;
        this.leftArrow.disabled = true;

        this.arrowsElement.addEventListener('click', (event) => {
            if (event.target instanceof HTMLButtonElement) {
                if (event.target.classList.contains('left')) {
                    this.showPreviousHistory();
                } else {
                    this.showNextHistory();
                }
            }
        });
    }

    protected onArrowReelsClick(): void {
        this.leftReelArrow =
            this.arrowsReelsElement.querySelector<HTMLButtonElement>('.history__arrow-left')!;
        this.rightReelArrow =
            this.arrowsReelsElement.querySelector<HTMLButtonElement>('.history__arrow-right')!;
        this.rightReelArrow.disabled = true;
        this.leftReelArrow.disabled = true;

        this.arrowsReelsElement.addEventListener('click', (event) => {
            if (event.target instanceof HTMLButtonElement) {

                if (event.target.classList.contains('left')) {
                    this.currentReelNumber--;
                } else {
                    this.currentReelNumber++;
                }
                this.createReels();

                this.leftReelArrow.disabled = this.currentReelNumber === 0;
                this.rightReelArrow.disabled =
                    this.currentReelNumber ===
                    this.currentHistorySpin.spin.avalanches.length - 1;
            }
        });
    }

    setTexts() {
        const transactionElements =
            this.transactionElements.querySelectorAll<HTMLDivElement>('.history__info-left')!;
        transactionElements.forEach((item, index) => {
            item.textContent = this.transactionsText[index];
        });

        const gameDataElements =
            this.gameDataElements.querySelectorAll<HTMLDivElement>('.history__info-left')!;
        gameDataElements.forEach((item, index) => {
            item.textContent = this.gameDataText[index];
        });

        this.gameDataElements.querySelector<HTMLDivElement>('.history__info-title')!.textContent =
            this.gameDataTitle;
    }

    formatDateTime(inputDateString: String) {
        //@ts-ignore
        const inputDate = new Date(inputDateString);

        const year = inputDate.getUTCFullYear();
        const month = (inputDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = inputDate.getUTCDate().toString().padStart(2, '0');
        const hours = inputDate.getUTCHours().toString().padStart(2, '0');
        const minutes = inputDate.getUTCMinutes().toString().padStart(2, '0');
        const seconds = inputDate.getUTCSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    createReels() {
        const columns = this.container.querySelectorAll<HTMLDivElement>('.history__reels-column')!;
        columns.forEach((column) => {
            const images = column.querySelectorAll('img');
            images.forEach((image) => {
                image.remove();
            });
        });

        let loadImg = 0;
        let allSymbol = 0;
        this.currentHistorySpin.spin.avalanches[this.currentReelNumber].window.forEach(
            (item: number[]) => {
                allSymbol += item.length;
            },
        );
        this.currentHistorySpin.spin.avalanches[this.currentReelNumber].window.forEach(
            (item: any, index: any) => {
                const symbols = [...item].reverse();

                symbols.forEach((element: any, i: any) => {
                    const imgElement = document.createElement('img');
                    columns[index].appendChild(imgElement);
                    imgElement.style.opacity = '0.3';
                    imgElement.onload = () => {
                        loadImg++;
                        if (loadImg >= allSymbol) {
                            this.reels.style.display = 'flex';
                            this.content.style.display = 'block';
                            if (this.currentHistorySpin.fs) {
                                this.freeSpinText.style.display = 'block';
                            }
                        }
                    };
                    if (index !== 0 && index !== 5) {
                        if (i === 0) {
                            imgElement.className = 'history__reels-image-top';
                            imgElement.src = this.createSymbol(element, 3);
                        } else {
                            imgElement.src = this.createSymbol(element, symbols.length - 2);
                        }
                    } else {
                        imgElement.src = this.createSymbol(element, symbols.length - 1);
                    }
                });
            },
        );
        if (this.currentHistorySpin.spin.avalanches[this.currentReelNumber].pay_items) {
            this.currentHistorySpin.spin.avalanches[
                this.currentReelNumber
            ].pay_items!.forEach((pay_item: any) => {
                pay_item.indexes.forEach((winItem: number, idx: number) => {
                    if (winItem === null) return;

                    const images = columns[idx].querySelectorAll('img');
                    if (images[images.length - winItem - 1]) {
                        images[images.length - winItem - 1].style.opacity = '1';
                    }
                });
            });
        }
    }

    showNextHistory = () => {
        if (this.currentSpinIndex + 1 >= this.flattenHistory.length) {
            if (this.lastPage > this.currentPage) {
                this.currentPage++;
                this.currentSpinIndex++;
                this.hide_data();
                this.loadHistory(this.currentPage);
            }
        } else {
            this.hide_data();
            this.currentSpinIndex++;
            this.updateSlotMachine();
        }
    };

    showPreviousHistory = () => {
        if (this.currentSpinIndex <= 0) return;

        this.hide_data();
        this.currentSpinIndex--;
        this.updateSlotMachine();
    };

    createSymbol(symbol: any, win: Number) {
        let spine: SpineAnimation;
        if (symbol <= 5 || symbol >= 11) {
            spine = new SpineAnimation(`symbol_${symbol}`);
            spine.play(`win_${win}`).pause();
        } else {
            spine = new SpineAnimation(`low_symbol`);
            //@ts-ignore
            spine.changeSkin(LOW_SYMBOLS[symbol]);
            spine.play(`win_${win}`).pause();
        }
        const texture = App.$instance.renderer.generateTexture(spine);
        return App.$instance.renderer.extract.canvas(texture).toDataURL!('image/png');
    }
}
