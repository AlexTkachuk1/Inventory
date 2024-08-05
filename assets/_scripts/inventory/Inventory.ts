import {_decorator, Color, Component, EditBox, Input, instantiate, Node, Prefab, Vec3} from 'cc';
import {ItemsLoader} from "db://assets/_scripts/inventory/ItemsLoader";
import {ItemsAPI} from "db://assets/_scripts/inventory/ItemsAPI";
import {
    CELL_SIZE,
    DEFAULT_GRID_HEIGHT,
    DEFAULT_GRID_WIDTH,
    FIRST_ITEM_X,
    FIRST_ITEM_Y
} from "db://assets/_scripts/data/Constsnts";
import {Item, ItemData, ItemType} from "db://assets/_scripts/data/Types";
import {ItemAPI} from "db://assets/_scripts/inventory/ItemAPI";

const { ccclass, property } = _decorator;

@ccclass('Inventory')
export class Inventory extends Component {
    @property({type: Color, visible: true}) private _hoveredColor: Color;
    @property({type: Color, visible: true}) private _idleColor: Color;
    @property({type: ItemsAPI, visible: true}) private _itemsAPI: ItemsAPI;
    @property({type: Prefab, visible: true}) private _item: Prefab;
    @property({type: ItemsLoader, visible: true}) private _loader: ItemsLoader;
    @property({type: Node, visible: true}) private _inventoryGrid: Node;
    @property({type: Node, visible: true}) private _inventoryArea: Node;
    @property({type: EditBox, visible: true}) private _filterInput: EditBox;

    private _items: Item[];
    private _itemsData: ItemData[] = [];
    private _debounceTimeout: any = null;
    private _debounceDelay: number = 800;
    private _canSaveData: boolean = true;

    public itemInUse: ItemAPI|null;

    get item(): Prefab {
        return this._item;
    }

    public start(): void {
        this._items = this._loader.loadItems();

        const inventoryItemsData: ItemData[] = this.initItemsGrid();
        this.instantiateInventoryItems(inventoryItemsData);
    }

    protected onEnable(): void {
        this._inventoryArea.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        this._filterInput.node.on('text-changed', this.onTextChanged, this);
        this._filterInput.node.on('editing-did-began', this.onEditingDidBegan, this);
    }

    protected onDisable(): void {
        this._inventoryArea.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        this._filterInput.node.off('text-changed', this.onTextChanged, this);
        this._filterInput.node.off('editing-did-began', this.onEditingDidBegan, this);
    }

    private onTextChanged(editBox: EditBox): void {
        if (this._debounceTimeout) clearTimeout(this._debounceTimeout);

        this._debounceTimeout = setTimeout((): void => {
            if (editBox.string.trim().length === 0) {
                this._canSaveData = true;
                this.killAllItems();
                this.createItemsGridByData(this._itemsData);
            } else if (editBox.string.trim().length > 0) {
                this.killAllItems();
                const newData: ItemData[] = this.filterItemsData(editBox.string.trim());
                this.createItemsGridByData(newData);
                this._canSaveData = false;
            }
        }, this._debounceDelay);
    }

    private onEditingDidBegan(_editBox: EditBox): void {
        if (this._itemsData.length === 0) {
            this.updateItemsData();
        }
    }

    private onMouseUp(): void {
        if (this.itemInUse) {
            this.itemInUse.resetItem();
        }
    }

    private initItemsGrid(): ItemData[] {
        const emptyItemsGrid: ItemData[] = this.initEmptyItemsGrid();

        for (let i: number = 0; i < this._items.length; i += 1) {
            const item: Item = this._items[i];

            emptyItemsGrid[i].id = item.id;
            emptyItemsGrid[i].count = item.count;
            emptyItemsGrid[i].itemPrefab = this._item;
            emptyItemsGrid[i].itemType = item.itemType;
            emptyItemsGrid[i].name = item.name;
        }

        return emptyItemsGrid;
    }

    private initEmptyItemsGrid(): ItemData[] {
        const itemsGrid: ItemData[] = [];
        const defaultCapacity: number = DEFAULT_GRID_WIDTH * DEFAULT_GRID_HEIGHT;
        const gridsCount: number = Math.ceil(this._items.length / defaultCapacity);

        for (let s: number = 0; s < gridsCount; s+=1) {
            for (let y: number = 0; y < DEFAULT_GRID_HEIGHT; y+=1) {
                for (let x: number = 0; x < DEFAULT_GRID_WIDTH; x+=1) {
                    const posX: number = FIRST_ITEM_X + (CELL_SIZE * x);
                    const posY: number = FIRST_ITEM_Y - (CELL_SIZE * y) + (CELL_SIZE * DEFAULT_GRID_HEIGHT * s);

                    const data: ItemData = {
                        x: posX,
                        y: posY,
                        index: (x + ((y + DEFAULT_GRID_HEIGHT * s) * DEFAULT_GRID_WIDTH)),
                        id: 0,
                        count: 0,
                        name: "",
                        itemPrefab: this._item,
                        itemType: ItemType.Empty,
                    };

                    itemsGrid.push(data);
                }
            }
        }

        return itemsGrid;
    }
    
    private instantiateInventoryItems(inventoryItemsData: ItemData[]): void{
        for (let i: number = 0; i < inventoryItemsData.length; i += 1) {
            this.instantiateItem(inventoryItemsData[i]);
        }
    }

    private instantiateItem(data :ItemData): Node {
        const itemPrefab: Prefab = data.itemPrefab;
        const itemNode: Node = instantiate(itemPrefab);
        const itemAPI: ItemAPI = itemNode.getComponent(ItemAPI);

        if (data.itemType !== ItemType.Empty) {
            itemAPI.icon.spriteFrame = this._itemsAPI.getItemPrefab(data.itemType);
            itemAPI.setName(data.name);
            itemAPI.setCount(data.count.toString());
        } else {
            itemAPI.hoveredColor = itemAPI.idleColor;
        }

        itemAPI.initItemAPI(
            this._inventoryArea,
            this, new Vec3(data.x, data.y, itemNode.position.z),
            data
        );
        this._inventoryGrid.insertChild(itemNode, data.index);

        itemNode.setPosition(data.x, data.y, itemNode.position.z);
        return itemNode;
    }

    private getAllItemsData(): ItemData[] {
        let result: ItemData[] = [];

        for (let i: number = 0; i < this.node.children.length; i++) {
            const itemAPI: ItemAPI = this.node.children[i].getComponent(ItemAPI);

            result.push(itemAPI.itemData);
        }
        result = this.sortItemsByIndex(result);
        this._itemsData = result;

        return result;
    }

    private sortItemsByIndex(items: ItemData[]): ItemData[] {
        return items.sort((a, b) => a.index - b.index);
    }

    private filterItemsData(text: string): ItemData[] {
        const result: ItemData[] = [];
        let index: number = 0;

        for (let i: number = 0; i < this._itemsData.length; i++) {
            const itemData: ItemData = this._itemsData[i];

            if (itemData.name.toLowerCase().includes(text.toLowerCase())) {
                const itemDataClone: ItemData = this.cloneItemData(itemData);
                itemDataClone.index = index;
                index += 1;
                result.push(itemDataClone);
            }
        }

        return result;
    }

    private createItemsGridByData(itemsData: ItemData[]): void {
        const defaultCapacity: number = DEFAULT_GRID_WIDTH * DEFAULT_GRID_HEIGHT;
        const gridsCount: number = Math.ceil(itemsData.length / defaultCapacity);

        for (let s: number = 0; s < gridsCount; s+=1) {
            for (let y: number = 0; y < DEFAULT_GRID_HEIGHT; y+=1) {
                for (let x: number = 0; x < DEFAULT_GRID_WIDTH; x+=1) {
                    const posX: number = FIRST_ITEM_X + (CELL_SIZE * x);
                    const posY: number = FIRST_ITEM_Y - (CELL_SIZE * y) + (CELL_SIZE * DEFAULT_GRID_HEIGHT * s);
                    const index: number = (x + ((y + DEFAULT_GRID_HEIGHT * s) * DEFAULT_GRID_WIDTH));
                    let data: ItemData;

                    if (itemsData[index]) {
                        data = itemsData[index];
                        data.x = posX;
                        data.y = posY;
                        data.index = index;
                    } else {
                        data = {
                            x: posX,
                            y: posY,
                            index: index,
                            id: 0,
                            count: 0,
                            name: "",
                            itemPrefab: this._item,
                            itemType: ItemType.Empty,
                        };
                    }

                    this.instantiateItem(data);
                }
            }
        }
    }

    private killAllItems(): void {
        for (let i: number = this.node.children.length - 1; i >= 0; i-=1) {
            this.node.children[i].destroy();
        }
    }

    private cloneItemData(data: ItemData): ItemData {
        let result: ItemData;

        result = {
            x: data.x,
            y: data.y,
            index: data.index,
            name: data.name,
            id: data.id,
            count: data.count,
            itemType: data.itemType,
            itemPrefab: data.itemPrefab
        };

        return result;
    }

    public updateItemsData(): void {
        if (this._canSaveData) this.getAllItemsData();
    }

    public replaceItem(data :ItemData): void {
        for (let i: number = 0; i < this.node.children.length; i++) {
            const target: ItemAPI = this.node.children[i].getComponent(ItemAPI);
            if (target.itemData.index === data.index) {
                target.icon.spriteFrame = this._itemsAPI.getItemPrefab(data.itemType);
                target.itemData.itemType = data.itemType;
                target.itemData.itemPrefab = data.itemPrefab;

                if (data.itemType !== ItemType.Empty) target.hoveredColor = this._hoveredColor;
                else target.hoveredColor = this._idleColor;


                target.idleColor = this._idleColor;
                target.setCount(data.count.toString());
                target.setName(data.name);
                target.bg.color = this._idleColor;
                return;
            }
        }
    }

    public getItemDataByIndex(index: number): ItemData {
        for (let i: number = 0; i < this.node.children.length; i++) {
            const target: ItemAPI = this.node.children[i].getComponent(ItemAPI);
            if (target.itemData.index === index) {
                return target.itemData;
            }
        }
    }

    public getItemTypeByIndex(index: number): ItemType {
        for (let i: number = 0; i < this.node.children.length; i++) {
            const target: ItemAPI = this.node.children[i].getComponent(ItemAPI);
            if (target.itemData.index === index) {
                return target.itemData.itemType;
            }
        }
    }

    public getItemAPIByIndex(index: number): ItemAPI {
        for (let i: number = 0; i < this.node.children.length; i++) {
            const target: ItemAPI = this.node.children[i].getComponent(ItemAPI);
            if (target.itemData.index === index) {
                return target;
            }
        }
    }

    public itemIsEmpty(itemIndex: number): boolean {
        for (let i: number = 0; i < this.node.children.length; i++) {
            const target: ItemAPI = this.node.children[i].getComponent(ItemAPI);
            if (target.itemData.index === itemIndex) {
                return target.itemData.itemType === ItemType.Empty;
            }
        }
    }
}
