import { _decorator, Component, Node, input, Input, Vec3, EventMouse, math } from 'cc';
import {PlayerInput} from "db://assets/_scripts/player/PlayerInput";
const { ccclass, property } = _decorator;

@ccclass('PlayerMover')
export class PlayerMover extends Component {
    @property({type: Number, visible: true}) private _speed: number;
    @property({type: Number, visible: true}) private _lookSpeed: number = 0.003;
    @property({type: Node, visible: true}) private _camera: Node;
    @property({type: PlayerInput, visible: true}) private _playerInput: PlayerInput;

    private _velocity: { x: number, y: number } = { x: 0, y: 0 };
    private _rotationX: number = 0;
    private _rotationY: number = 0;

    protected onEnable(): void {
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this._playerInput.onKey_W_Down.subscribe(this.onKey_W_Down.bind(this), this);
        this._playerInput.onKey_S_Down.subscribe(this.onKey_S_Down.bind(this), this);
        this._playerInput.onKey_A_Down.subscribe(this.onKey_A_Down.bind(this), this);
        this._playerInput.onKey_D_Down.subscribe(this.onKey_D_Down.bind(this), this);
        this._playerInput.onKey_W_Up.subscribe(this.onKey_W_Up.bind(this), this);
        this._playerInput.onKey_S_Up.subscribe(this.onKey_S_Up.bind(this), this);
        this._playerInput.onKey_A_Up.subscribe(this.onKey_A_Up.bind(this), this);
        this._playerInput.onKey_D_Up.subscribe(this.onKey_D_Up.bind(this), this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this._playerInput.onKey_W_Down.unsubscribe(this.onKey_W_Down.bind(this), this);
        this._playerInput.onKey_S_Down.unsubscribe(this.onKey_S_Down.bind(this), this);
        this._playerInput.onKey_A_Down.unsubscribe(this.onKey_A_Down.bind(this), this);
        this._playerInput.onKey_D_Down.unsubscribe(this.onKey_D_Down.bind(this), this);
        this._playerInput.onKey_W_Up.unsubscribe(this.onKey_W_Up.bind(this), this);
        this._playerInput.onKey_S_Up.unsubscribe(this.onKey_S_Up.bind(this), this);
        this._playerInput.onKey_A_Up.unsubscribe(this.onKey_A_Up.bind(this), this);
        this._playerInput.onKey_D_Up.unsubscribe(this.onKey_D_Up.bind(this), this);
    }

    public update(dT: number): void {
        this.updateRotX();
        this.updateRotY();
    }

    public lateUpdate(dT: number): void {
        if (this._playerInput.inventoryIsOpen) return;

        this.updatePosition(dT);
    }

    private onKey_W_Up(): void {
        this._velocity.x -= 1;
    }

    private onKey_S_Up(): void {
        this._velocity.x += 1;
    }

    private onKey_A_Up(): void {
        this._velocity.y -= 1;
    }

    private onKey_D_Up(): void {
        this._velocity.y += 1;
    }

    private onKey_W_Down(): void {
        this._velocity.x += 1;
        if (this._velocity.x > 1) this._velocity.x = 1;
    }

    private onKey_S_Down(): void {
        this._velocity.x -= 1;
        if (this._velocity.x < -1) this._velocity.x = -1;
    }

    private onKey_A_Down(): void {
        this._velocity.y += 1;
        if (this._velocity.y > 1) this._velocity.y = 1;
    }

    private onKey_D_Down(): void {
        this._velocity.y -= 1;
        if (this._velocity.y < -1) this._velocity.y = -1;
    }

    private onMouseMove(event: EventMouse): void {
        if (this._playerInput.inventoryIsOpen) return;

        const deltaX: number = event.getDeltaX() * 0.5;
        const deltaY: number = event.getDeltaY() * this._lookSpeed;

        const rot = this.node.eulerAngles;
        const cameraRot = this._camera.rotation;

        this._rotationX = math.clamp(cameraRot.z + deltaY, -0.35, 0.35);
        this._rotationY = rot.y - deltaX;
    }

    private updatePosition(dT: number): void {
        let pos: Vec3 = this.node.position;
        const velocity = this.adjustVelocityForEulerAngles(this._velocity, this.node.eulerAngles);

        const x: number = pos.x + (velocity.x * dT * this._speed);
        const y: number = pos.z + (velocity.y * dT * this._speed);
        this.node.setPosition(new Vec3(x, pos.y, y));
    }

    private updateRotX(): void {
        const rot = this.node.eulerAngles;

        this.node.setWorldRotationFromEuler(rot.x, this._rotationY, rot.z);
    }

    private updateRotY(): void {
        const cameraRot = this._camera.rotation;

        this._camera.setRotation(new math.Quat(cameraRot.x, cameraRot.y, this._rotationX, cameraRot.w));
    }

    private adjustVelocityForEulerAngles(velocity: { x: number, y: number }, eulerAngles: Vec3): { x: number, y: number } {
        const yaw: number = eulerAngles.y * math.toRadian(1);
        const cosYaw: number = Math.cos(yaw);
        const sinYaw: number = Math.sin(yaw);

        const adjustedX: number = velocity.x * cosYaw - velocity.y * sinYaw;
        const adjustedY: number = velocity.x * sinYaw + velocity.y * cosYaw;

        return { x: adjustedX, y: -adjustedY };
    }
}


