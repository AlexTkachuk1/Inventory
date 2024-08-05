import { _decorator, Component } from 'cc';
import {OpacityAnimationComponent} from "db://assets/_scripts/components/OpacityAnimationComponent";
import {PlayerInput} from "db://assets/_scripts/player/PlayerInput";
import {Event} from "db://assets/_scripts/helpers/Event";
const { ccclass, property } = _decorator;

@ccclass('StartMenuView')
export class StartMenuView extends Component {
    @property({type: OpacityAnimationComponent, visible: true}) private _showAnim: OpacityAnimationComponent;
    @property({type: OpacityAnimationComponent, visible: true}) private _hideAnim: OpacityAnimationComponent;
    @property({type: PlayerInput, visible: true}) private _playerInput: PlayerInput;

    public readonly onShow: Event<void> = new Event<void>();
    public readonly onHide: Event<void> = new Event<void>();

    public start(): void {
        this._playerInput.onExitMainGame.subscribe(this._showAnim.show.bind(this._showAnim), this);
        this._playerInput.onEnterMainGame.subscribe(this._hideAnim.show.bind(this._hideAnim), this);
    }
}
