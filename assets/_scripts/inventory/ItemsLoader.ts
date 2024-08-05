import { _decorator, Component } from 'cc';
import {Item, ItemType} from "db://assets/_scripts/data/Types";
const { ccclass, property } = _decorator;

@ccclass('ItemsLoader')
export class ItemsLoader extends Component {
    public loadItems(): Item[] {
        //TODO Заменить на подгрузку откуда-нибудь, скажем подсасывать через веб-сокеты на открытие окна инвентаря.

        return this.generateRandomItems(16);
    }

    private randomRangeInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private generateRandomItems(count: number): Item[] {
        const items: Item[] = [];
        let currentId: number = 1;

        for (let i: number = 0; i < count; i++) {
            const itemType: ItemType = this.randomRangeInt(1, 20) as ItemType;
            const name: string = ItemType[itemType];
            const itemCount: number = this.randomRangeInt(1, 10);

            const item: Item = {
                id: currentId,
                name,
                count: itemCount,
                itemType,
            };

            items.push(item);
            currentId += 1;
        }

        return items;
    }
}


