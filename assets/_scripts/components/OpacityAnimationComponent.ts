import { _decorator, Component, tween, UIOpacity } from 'cc';
import {Event} from "db://assets/_scripts/helpers/Event";
import {TweenEasing} from "db://assets/_scripts/helpers/TweenEasing";

const { ccclass, property } = _decorator;

@ccclass('OpacityAnimationComponent')
export class OpacityAnimationComponent extends Component {
    @property({type: UIOpacity, visible: true}) private _target: UIOpacity;
    @property({type: Number, visible: true}) private _startOpacity: number;
    @property({type: Number, visible: true}) private _endOpacity: number;
    @property({type: Number, visible: true}) private _delay: number;
    @property({type: Number, visible: true}) private _duration: number;

    public readonly onStart: Event<void> = new Event<void>();
    public readonly onEnd: Event<void> = new Event<void>();

    public show(): void {
        if (this._startOpacity !== undefined && this._target.opacity !== this._startOpacity) {
            this._target.opacity = this._startOpacity;
        }

        this.onStart.invoke();

        tween(this._target)
            .delay(this._delay)
            .to(this._duration, {opacity: this._endOpacity}, {easing: TweenEasing.sineIn})
            .call((): void => {
                this.onEnd.invoke();
            })
            .start();
    }
}
