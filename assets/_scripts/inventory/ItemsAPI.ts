import { _decorator, Component, Prefab, SpriteFrame } from 'cc';
import {ItemType} from "db://assets/_scripts/data/Types";
const { ccclass, property } = _decorator;

@ccclass('ItemsAPI')
export class ItemsAPI extends Component {
    @property({type: SpriteFrame, visible: true}) private _apple: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _book: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _bow: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _codex: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _coin: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _ham: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _hat: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _helmet: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _honey: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _key: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _pick: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _potion: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _scoop: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _scroll: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _scull: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _sheet: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _something: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _sword: SpriteFrame;
    @property({type: SpriteFrame, visible: true}) private _tankard: SpriteFrame;

    public getItemPrefab(itemType: ItemType): SpriteFrame {
        switch (itemType) {
            case ItemType.Apple:
                return this._apple;
            case ItemType.Bow:
                return this._bow;
            case ItemType.Book:
                return this._book;
            case ItemType.Codex:
                return this._codex;
            case ItemType.Ham:
                return this._ham;
            case ItemType.Hat:
                return this._hat;
            case ItemType.Coin:
                return this._coin;
            case ItemType.Key:
                return this._key;
            case ItemType.Helmet:
                return this._helmet;
            case ItemType.Pick:
                return this._pick;
            case ItemType.Honey:
                return this._honey;
            case ItemType.Potion:
                return this._potion;
            case ItemType.Scoop:
                return this._scoop;
            case ItemType.Scroll:
                return this._scroll;
            case ItemType.Scull:
                return this._scull;
            case ItemType.Sheet:
                return this._sheet;
            case ItemType.Sword:
                return this._sword;
            case ItemType.Tankard:
                return this._tankard;
            case ItemType.Something:
                return this._something;
            default:
                return null;
        }
    }
}


