class ShipControler {

    public ship: Ship;
    public scene: BABYLON.Scene;

    constructor(
        ship: Ship,
        scene: BABYLON.Scene
    ) {
        this.ship = ship;
        this.scene = scene;
        this.scene.registerBeforeRender(this._checkInputs);
    }

    private _checkInputs = () => {
        let pickInfo = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY,
            (mesh) => {
                return mesh === Main.instance.groundZero;
            }
        )
        if (pickInfo.hit) {
            this.ship.target.copyFrom(pickInfo.pickedPoint);
        }
    }
}