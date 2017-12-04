class ShipControler {

    public ship: Ship;
    public scene: BABYLON.Scene;

    public forward: boolean;
    public right: boolean;
    public left: boolean;

    constructor(
        ship: Ship,
        scene: BABYLON.Scene
    ) {
        this.ship = ship;
        this.scene = scene;
        this.scene.registerBeforeRender(this._checkInputs);

        window.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key === "ArrowLeft") {
                this.left = true;
            }
            if (ev.key === "ArrowRight") {
                this.right = true;
            }
            if (ev.key === "ArrowUp") {
                this.forward = true;
            }
        };

        window.onkeyup = (ev: KeyboardEvent) => {
            if (ev.key === "ArrowLeft") {
                this.left = false;
            }
            if (ev.key === "ArrowRight") {
                this.right = false;
            }
            if (ev.key === "ArrowUp") {
                this.forward = false;
            }
        };
    }

    private _checkInputs = () => {
        if (this.ship.instance) {
            let newTarget = this.ship.instance.position.clone();
            if (Main.instance.pointerDown) {
                let pickInfo = this.scene.pick(
                    this.scene.pointerX,
                    this.scene.pointerY,
                    (mesh) => {
                        return mesh === Main.instance.groundZero;
                    }
                )
                if (pickInfo.hit) {
                    newTarget.copyFrom(pickInfo.pickedPoint);
                }
            } else {
                let localTarget = BABYLON.Vector3.Zero();
                if (this.forward) {
                    localTarget.z = 20;
                }
                if (this.right) {
                    localTarget.x = 10;
                } else if (this.left) {
                    localTarget.x = -10;
                }
                BABYLON.Vector3.TransformCoordinatesToRef(localTarget, this.ship.instance.getWorldMatrix(), newTarget);
            }
            this.ship.target.copyFrom(newTarget);
        }
    }
}