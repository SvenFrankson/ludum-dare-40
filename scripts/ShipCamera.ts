class ShipCamera extends BABYLON.FreeCamera {

    public smoothness: number = 60;
    public ship: Ship;

    constructor(name: string, ship: Ship, scene: BABYLON.Scene) {
        super(name, BABYLON.Vector3.Zero(), scene);
        this.ship = ship;
        scene.registerBeforeRender(this._update);
    }

    private _update = () => {
        if (this.ship && this.ship.instance) {
            let targetPos = this.ship.instance.position.clone();
            targetPos.y = 5;

            let cameraPos = this.ship.instance.getDirection(BABYLON.Axis.Z);
            cameraPos.y = 0;
            cameraPos.scaleInPlace(-30);
            cameraPos.addInPlace(new BABYLON.Vector3(0, 30, 0));
            cameraPos.x += this.ship.instance.position.x;
            cameraPos.z += this.ship.instance.position.z;

            this.position = BABYLON.Vector3.Lerp(this.position, cameraPos, 1 / this.smoothness);
            this.update();
            this.setTarget(targetPos);
        }
    }
}