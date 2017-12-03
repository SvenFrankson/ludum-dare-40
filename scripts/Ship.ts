class Ship {

    public instance: BABYLON.AbstractMesh;
    public container: BABYLON.AbstractMesh;
    public sea: Sea;
    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public speed: number = 0;

    constructor(sea: Sea) {
        this.sea = sea;
    }

    public debugDir: BABYLON.RayHelper;
    public debugZ: BABYLON.RayHelper;
    private _update = () => {
        if (this.instance) {
            let deltaTime: number = this.instance.getScene().getEngine().getDeltaTime();
            let dir: BABYLON.Vector3 = this.target.subtract(this.instance.position);
            let forward: BABYLON.Vector3 = this.instance.getDirection(BABYLON.Axis.Z);

            let targetSpeed = BABYLON.Vector3.Distance(this.target, this.instance.position) / 10 * 5;
            targetSpeed = Math.min(Math.max(targetSpeed, 0), 10);
            this.speed = BABYLON.Scalar.Lerp(this.speed, targetSpeed, 0.005);

            this.instance.position.x += forward.x * deltaTime / 1000 * this.speed;
            this.instance.position.z += forward.z * deltaTime / 1000 * this.speed;
            this.instance.position.y = this.sea.evaluate(this.instance.position.x, this.instance.position.z);

            let alpha = LDMath.AngleFromToAround(forward, dir, BABYLON.Axis.Y);
            /*
            if (this.debugDir) {
                this.debugDir.dispose();
               
            }
            this.debugDir = BABYLON.RayHelper.CreateAndShow(
                new BABYLON.Ray(this.instance.position, dir, 10), this.instance.getScene(), BABYLON.Color3.Blue()
            );
            if (this.debugZ) {
                this.debugZ.dispose();
            }
            this.debugZ = BABYLON.RayHelper.CreateAndShow(
                new BABYLON.Ray(this.instance.position, forward, 10), this.instance.getScene(), BABYLON.Color3.Red()
            );
            */
            if (isFinite(alpha)) {
                this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), Math.PI / 8 * deltaTime / 1000));
                this.container.rotation.x = -Math.PI / 16 * this.speed / 10;
                this.container.rotation.z = Math.sign(alpha) * Math.min(Math.abs(alpha) / 2, Math.PI / 16);
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
                this.container = new BABYLON.Mesh("Container", scene);
                this.container.parent = this.instance;
                meshes.forEach(
                    (m) => {
                        m.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.Black();
                        m.outlineWidth = 0.01;
                        m.parent = this.container;
                    }
                );
                new ShipTrail(this.instance.position, this.instance, 0.6, scene);
                new ShipTrail(this.instance.position, this.instance, -0.6, scene);
                scene.registerBeforeRender(this._update);
                if (callback) {
                    callback();
                }
            }
        )
    }
}