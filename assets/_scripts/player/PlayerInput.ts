import { _decorator, Component, input, Input, EventKeyboard, KeyCode, game } from 'cc';
import {Event} from "db://assets/_scripts/helpers/Event";
const { ccclass, property } = _decorator;

@ccclass('PlayerInput')
export class PlayerInput extends Component {
    public readonly onEnterI: Event<void> = new Event<void>();
    public readonly onExitI: Event<void> = new Event<void>();
    public readonly onEnterMainGame: Event<void> = new Event<void>();
    public readonly onExitMainGame: Event<void> = new Event<void>();

    public readonly onKey_W_Up: Event<void> = new Event<void>();
    public readonly onKey_S_Up: Event<void> = new Event<void>();
    public readonly onKey_A_Up: Event<void> = new Event<void>();
    public readonly onKey_D_Up: Event<void> = new Event<void>();
    public readonly onKey_W_Down: Event<void> = new Event<void>();
    public readonly onKey_S_Down: Event<void> = new Event<void>();
    public readonly onKey_A_Down: Event<void> = new Event<void>();
    public readonly onKey_D_Down: Event<void> = new Event<void>();

    private _inventoryIsOpen: boolean = false;

    get inventoryIsOpen(): boolean {
        return this._inventoryIsOpen;
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: EventKeyboard): void {
        const key: KeyCode = event.keyCode;

        if (key === KeyCode.KEY_W) this.onKey_W_Down.invoke();
        if (key === KeyCode.KEY_S) this.onKey_S_Down.invoke();
        if (key === KeyCode.KEY_A) this.onKey_A_Down.invoke();
        if (key === KeyCode.KEY_D) this.onKey_D_Down.invoke();
        if (key === KeyCode.ENTER) {
            this.onEnterMainGame.invoke();
            game.canvas.requestPointerLock();

            //TODO Здесь мы видим классический cocos moment, если конкретнее, то если раскомментировать следующую
            // строку, то сломается компонент EditBox инвентаря!

            // game.canvas.requestFullscreen();
        }
        if (key === KeyCode.ESCAPE) {
            this.onExitMainGame.invoke();
            // document.exitPointerLock();
        }
        if (key === KeyCode.KEY_I) {
            this._inventoryIsOpen = !this._inventoryIsOpen;

            if (this._inventoryIsOpen) {
                this.onEnterI.invoke();
                document.exitPointerLock();
            } else {
                this.onExitI.invoke();
                game.canvas.requestPointerLock();
            }
        }
    }

    private onKeyUp(event: EventKeyboard): void {
        const key: KeyCode = event.keyCode;

        if (key === KeyCode.KEY_W) this.onKey_W_Up.invoke();
        if (key === KeyCode.KEY_S) this.onKey_S_Up.invoke();
        if (key === KeyCode.KEY_A) this.onKey_A_Up.invoke();
        if (key === KeyCode.KEY_D) this.onKey_D_Up.invoke();
    }
}
