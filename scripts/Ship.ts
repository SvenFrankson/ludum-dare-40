class Ship {

    public instance: BABYLON.AbstractMesh;
    public sea: Sea;
    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public speed: number = 5;

    constructor(sea: Sea) {
        this.sea = sea;
    }

    public debugDir: BABYLON.RayHelper;
    public debugZ: BABYLON.RayHelper;
    private _update = () => {
        if (this.instance) {
            let deltaTime: number = this.instance.getScene().getEngine().getDeltaTime();
            let dir: BABYLON.Vector3 = this.target.subtract(this.instance.position);
            if (dir.lengthSquared() > 1) {
                dir.normalize();
                this.instance.position.x += dir.x * deltaTime / 1000 * this.speed;
                this.instance.position.z += dir.z * deltaTime / 1000 * this.speed;
            }
            this.instance.position.y = this.sea.evaluate(this.instance.position.x, this.instance.position.z);
            let alpha = LDMath.AngleFromToAround(this.instance.getDirection(BABYLON.Axis.Z), dir, BABYLON.Axis.Y);
            if (this.debugDir) {
                this.debugDir.dispose();
               
            }
            this.debugDir = BABYLON.RayHelper.CreateAndShow(
                new BABYLON.Ray(this.instance.position, dir), this.instance.getScene(), BABYLON.Color3.Blue()
            );
            if (this.debugZ) {
                this.debugZ.dispose();
            }
            this.debugZ = BABYLON.RayHelper.CreateAndShow(
                new BABYLON.Ray(this.instance.position, this.instance.getDirection(BABYLON.Axis.Z)), this.instance.getScene(), BABYLON.Color3.Red()
            );
            if (isFinite(alpha)) {
                this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), Math.PI / 4 * deltaTime / 1000));
            }
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
                if (callback) {
                    callback();
                }
            }
        )
    }
}