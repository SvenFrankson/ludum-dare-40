class Ship {

    public instance: BABYLON.AbstractMesh;
    public sea: Sea;
    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public speed: number = 5;

    constructor(sea: Sea) {
        this.sea = sea;
    }

    private _update = () => {
        if (this.instance) {
            let deltaTime: number = this.instance.getScene().getEngine().getDeltaTime();
            console.log(deltaTime);
            let dir: BABYLON.Vector3 = this.target.subtract(this.instance.position);
            if (dir.lengthSquared() > 1) {
                dir.normalize();
                this.instance.position.x += dir.x * deltaTime / 1000 * this.speed;
                this.instance.position.z += dir.z * deltaTime / 1000 * this.speed;
            }
            this.instance.position.y = this.sea.evaluate(this.instance.position.x, this.instance.position.z);
        }
    }

    public instantiate(scene: BABYLON.Scene, callback?: () => void): void {
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/ship.babylon",
            "",
            scene,
            (meshes) => {
                this.instance = new BABYLON.Mesh("Ship", scene);
                meshes.forEach(
                    (m) => {
                        m.material = new ToonMaterial("ToonMaterial", scene);
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.Black();
                        m.outlineWidth = 0.01;
                        m.parent = this.instance;
                    }
                );
                scene.registerBeforeRender(this._update);
            }
        )
    }
}