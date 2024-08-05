import {_decorator, Color, Component, EventMouse, Input, Label, Node, Sprite, Vec3} from 'cc';
import {OpacityAnimationComponent} from "db://assets/_scripts/components/OpacityAnimationComponent";
import {Inventory} from "db://assets/_scripts/inventory/Inventory";
import {ItemData, ItemType} from "db://assets/_scripts/data/Types";

const { ccclass, property } = _decorator;

@ccclass('ItemAPI')
export class ItemAPI extends Component {
    @property({type: OpacityAnimationComponent, visible: true}) private _showName: OpacityAnimationComponent;
    @property({type: OpacityAnimationComponent, visible: true}) private _hideName: OpacityAnimationComponent;
    @property({type: Label, visible: true}) private _nameLabel: Label;
    @property({type: Label, visible: true}) private _countLabel: Label;

    @property({type: Color, visible: true}) public hoveredColor: Color;
    @property({type: Color, visible: true}) public idleColor: Color;
    @property({type: Sprite, visible: true}) public bg: Sprite;
    @property({type: Sprite, visible: true}) public icon: Sprite;

    private _inventoryArea: Node;
    private _inventory: Inventory;
    private _startPos: Vec3;
    private _startScale: Vec3;
    private _isDragging: boolean = false;
    private _itemData: ItemData;

    get itemData(): ItemData {
        return this._itemData;
    }

    public initItemAPI(inventoryArea: Node, inventory: Inventory, startPos: Vec3, itemData: ItemData): void {
        this._inventoryArea = inventoryArea;
        this._inventory = inventory;
        this._startPos = startPos;
        this._itemData = itemData;
        this._startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);

        this.enableItem();
    }

    public resetItem(): void {
        this.onDragEnd();
        this._isDragging = false;
        this.node.scale= this._startScale;
        this.node.position = this._startPos;
        this._inventory.itemInUse = null;
        this.bg.node.active = true;
        this._inventory.node.insertChild(this.node, this._itemData.index);
    }

    public setCount(text: string): void {
        let labelText: string = text.trim();
        if (labelText === "0") labelText = "";

        this._countLabel.string = labelText;
    }

    public setName(text: string): void {
        this._nameLabel.string = text;
    }

    protected onEnable(): void {
        if (this._inventoryArea) this.enableItem();
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this._inventoryArea.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private enableItem(): void {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this._inventoryArea.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private onDragStart(): void {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private onDragEnd(): void {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private onMouseEnter(): void {
        if (this._itemData.itemType === ItemType.Empty) return;

        this.bg.color = this.hoveredColor;
        this._showName.show();
    }

    private onMouseLeave(): void {
        if (this._itemData.itemType === ItemType.Empty) return;

        this.bg.color = this.idleColor;
        this._hideName.show();
    }

    private onMouseMove(event: EventMouse): void {
        if (!this._isDragging) return;

        const deltaX: number = event.getUIDeltaX();
        const deltaY: number = event.getUIDeltaY();

        this.updatePosition(deltaX, deltaY);
    }

    private onMouseDown(event: EventMouse): void {
        if (this._itemData.itemType === ItemType.Empty) return;

        if (event.getButton() == EventMouse.BUTTON_LEFT) {
            this.dragItem();
        } else if (event.getButton() == EventMouse.BUTTON_RIGHT) {
            this.splitItems();
        }
    }

    private onMouseUp(): void {
        if (!this._inventory.itemInUse) return;

        const activeItemData: ItemData = this._inventory.itemInUse._itemData;
        const currentItemData: ItemData = this._itemData;

        this._inventory.itemInUse.node.scale= this._startScale;
        this._inventory.itemInUse.bg.node.active = true;
        this._inventory.itemInUse.onDragEnd();

        if (activeItemData.itemType !== currentItemData.itemType
        && activeItemData.itemType !== ItemType.Empty) {
            this.swapItems();
        } else if (
            activeItemData.itemType === currentItemData.itemType
            && activeItemData.itemType !== ItemType.Empty
        ) {
            this.putItemsTogether();
        } else {
            this.resetItem();
        }
    }

    private dragItem(): void {
        this.onDragStart();
        this._inventory.node.insertChild(this.node, 63);

        this._isDragging = true;
        this.setScale(0.2);
        this._inventory.itemInUse = this;
        this.bg.node.active = false;
        this.node.position = new Vec3(this.node.position.x, this.node.position.y, 0);
    }

    private splitItems(): void {
        const itemIndex: number = this._itemData.index;
        const canSplit: boolean = this._inventory.itemIsEmpty(itemIndex + 1);
        const nextItemType: ItemType = this._inventory.getItemTypeByIndex(itemIndex + 1);

        if (canSplit && this._itemData.count > 1) {
            this.decreaseCount();
            this._itemData.count

            const data: ItemData = this._inventory.getItemDataByIndex(itemIndex + 1);
            data.count = 1;
            data.name = this._itemData.name;
            data.itemPrefab = this._inventory.item;
            data.itemType = this._itemData.itemType;
            data.index = itemIndex + 1;

            this._inventory.replaceItem(data);
            this._inventory.updateItemsData();
        } else if (this._itemData.count > 1 && nextItemType === this._itemData.itemType) {
            this.decreaseCount();
            this._inventory.getItemAPIByIndex(itemIndex + 1).increaseCount();
            this._inventory.updateItemsData();
        } else {
            console.warn("Разделить предмет невозможно");
        }
    }

    private swapItems(): void {
        const activeItemNode: Node = this._inventory.itemInUse.node;
        const activeItemPos: Vec3 = this._inventory.itemInUse._startPos;
        const oldActiveItemNodePos: Vec3 = new Vec3(
            activeItemPos.x,
            activeItemPos.y,
            activeItemPos.z
        );
        const newActiveItemNodePos: Vec3 = new Vec3(
            this.node.position.x,
            this.node.position.y,
            this.node.position.z
        );
        const oldIndex: number = this._inventory.itemInUse._itemData.index;

        this._inventory.itemInUse._isDragging = false;
        this._inventory.itemInUse._itemData.index = this._itemData.index;
        this._itemData.index = oldIndex;

        activeItemNode.position = newActiveItemNodePos;
        this.node.position = oldActiveItemNodePos;

        this.updatePositionData(this.node.position);
        this._inventory.itemInUse.updatePositionData(newActiveItemNodePos);
        this._inventory.itemInUse = null;

        this._inventory.updateItemsData();
    }

    private putItemsTogether(): void {
        this._itemData.count += this._inventory.itemInUse._itemData.count;
        this.setCount(this._itemData.count.toString());

        const data: ItemData = {
            x: this._inventory.itemInUse._startPos.x,
            y: this._inventory.itemInUse._startPos.y,
            id: this._inventory.itemInUse._itemData.id,
            count: 0,
            name: "",
            index: this._inventory.itemInUse._itemData.index,
            itemPrefab: this._inventory.item,
            itemType: ItemType.Empty,
        };

        this._inventory.replaceItem(data);
        this._inventory.updateItemsData();
    }

    private updatePosition(deltaX: number, deltaY: number): void {
        this.node.position = new Vec3(
            this.node.position.x + deltaX,
            this.node.position.y + deltaY,
            -10
        );
    }

    private setScale(deltaScale: number): void {
        this.node.scale = new Vec3(
            this.node.scale.x + deltaScale,
            this.node.scale.y + deltaScale,
            this.node.scale.z
        );
    }

    private updatePositionData(pos: Vec3): void{
        this._startPos = new Vec3(pos.x, pos.y, pos.z);
    }

    private decreaseCount(): void {
        if (this._itemData.count - 1 > 0) {
            this._itemData.count -= 1;
            this.setCount(this._itemData.count.toString());
        }
    }

    private increaseCount(): void {
        this._itemData.count += 1;
        this.setCount(this._itemData.count.toString());
    }
}
