class FishNet {

    public instance: BABYLON.AbstractMesh;

    constructor(public ship: Ship) {

    }
    
    public instantiate(scene: BABYLON.Scene): void {
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/fishnet.babylon",
            "",
            scene,
            (meshes) => {
                this.instance = meshes[0];
                this.instance.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
                this.instance.renderOutline = true;
                this.instance.outlineColor = BABYLON.Color3.Black();
                this.instance.outlineWidth = 0.01;
                scene.registerBeforeRender(this._updateFishNet);
            }
        )
    }

    private _updateFishNet = () => {
        if (this.ship && this.instance) {
            this.instance.position.y = this.ship.instance.position.y;
            let dir = this.ship.instance.position.subtract(this.instance.position);
            dir.normalize();
            this.instance.position = this.ship.instance.position.subtract(dir.scale(10));
            this.instance.lookAt(this.ship.instance.position, Math.PI);
        }
    }
}