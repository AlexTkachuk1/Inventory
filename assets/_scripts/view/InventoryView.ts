import { _decorator, Component, Node } from 'cc';
import {Event} from "db://assets/_scripts/helpers/Event";
import {OpacityAnimationComponent} from "db://assets/_scripts/components/OpacityAnimationComponent";
import {PlayerInput} from "db://assets/_scripts/player/PlayerInput";
const { ccclass, property } = _decorator;

@ccclass('InventoryView')
export class InventoryView extends Component {
    @property({type: OpacityAnimationComponent, visible: true}) private _showAnim: OpacityAnimationComponent;
    @property({type: OpacityAnimationComponent, visible: true}) private _hideAnim: OpacityAnimationComponent;
    @property({type: PlayerInput, visible: true}) private _playerInput: PlayerInput;
    @property({type: Node, visible: true}) private _inventoryFrame: Node;

    public readonly onShow: Event<void> = new Event<void>();
    public readonly onHide: Event<void> = new Event<void>();

    public start(): void {
        this._playerInput.onEnterI.subscribe(this.onEnterI.bind(this), this);
        this._playerInput.onExitI.subscribe(this.onExitI.bind(this), this);
    }

    private onEnterI(): void {
        this._inventoryFrame.active = true;
        this._showAnim.show();
    }

    private onExitI(): void {
        this._inventoryFrame.active = false;
        this._hideAnim.show();
    }
}
