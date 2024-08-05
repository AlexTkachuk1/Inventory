import {Prefab} from 'cc';

export type Item = {
    id: number;
    name: string;
    count: number;
    itemType: ItemType;
}

export type ItemData = {
    x: number;
    y: number;
    name: string;
    id: number;
    index: number;
    count: number;
    itemPrefab: Prefab;
    itemType: ItemType;
}

export enum ItemType {
    Apple = 1,
    Book = 2,
    Bow = 3,
    Codex = 4,
    Coin = 5,
    Ham = 6,
    Hat = 7,
    Helmet = 8,
    Honey = 9,
    Key = 10,
    Pick = 11,
    Potion = 12,
    Scoop = 13,
    Scroll = 14,
    Scull = 15,
    Sheet = 16,
    Something = 17,
    Sword = 18,
    Tankard = 19,
    Empty = 20,
}