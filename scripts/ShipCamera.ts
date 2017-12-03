class ShipCamera extends BABYLON.FreeCamera {

    public smoothness: number = 30;
    public ship: Ship;
    public k: number = 0;

    constructor(name: string, ship: Ship, scene: BABYLON.Scene) {
        super(name, BABYLON.Vector3.Zero(), scene);
        this.ship = ship;
        scene.registerBeforeRender(this._update);
    }

    private _update = () => {
        if (this.ship && this.ship.instance) {
            this.k++;
            let targetPos = this.ship.instance.position.clone();

            let cameraPos = this.ship.instance.getDirection(BABYLON.Axis.Z);
            cameraPos.y = 0;
            cameraPos.scaleInPlace(-20);
            if (!Main.instance.playing) {
                targetPos.y = 6;
                let x: number = Math.cos(Math.PI * this.k / 1200) * cameraPos.x - Math.sin(Math.PI * this.k / 1200) * cameraPos.z;
                let z: number = Math.sin(Math.PI * this.k / 1200) * cameraPos.x + Math.cos(Math.PI * this.k / 1200) * cameraPos.z;
                cameraPos.x = x;
                cameraPos.z = z;
            }
            cameraPos.addInPlace(new BABYLON.Vector3(0, 20, 0));
            cameraPos.x += this.ship.instance.position.x;
            cameraPos.z += this.ship.instance.position.z;

            this.position = BABYLON.Vector3.Lerp(this.position, cameraPos, 1 / this.smoothness);
            this.update();
            this.setTarget(targetPos);
        }
    }
}