class Ship {

    public instance: BABYLON.AbstractMesh;
    public container: BABYLON.AbstractMesh;
    public sea: Sea;
    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public fishnet: FishNet;

    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    constructor(sea: Sea) {
        this.sea = sea;
    }

    public debugDir: BABYLON.RayHelper;
    public debugZ: BABYLON.RayHelper;
    private _update = () => {
        if (this.instance && Main.instance.playing) {
            let deltaTime: number = this.instance.getScene().getEngine().getDeltaTime();
            let dir: BABYLON.Vector3 = this.target.subtract(this.instance.position);
            let forward: BABYLON.Vector3 = this.instance.getDirection(BABYLON.Axis.Z);
            let right: BABYLON.Vector3 = this.instance.getDirection(BABYLON.Axis.X);

            let speedInput = BABYLON.Vector3.Dot(dir, forward) / 20;
            speedInput = Math.min(Math.max(speedInput, 0), 1);
            let drag = 0.98;
            if (this.fishnet) {
                drag = Math.pow(drag, this.fishnet.protectedCaught + 1);
            }
            this.velocity.scaleInPlace(drag);
            if (dir.lengthSquared() > 1) {
                this.velocity.addInPlace(forward.scale(speedInput / 2.5));
            }

            this.instance.position.x += this.velocity.x * deltaTime / 1000;
            this.instance.position.z += this.velocity.z * deltaTime / 1000;
            this.instance.position.y = -0.5;

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
                if (dir.lengthSquared() > 1) {
                    this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), Math.PI / 2 * deltaTime / 1000));
                }
                this.container.rotation.x = -Math.PI / 16 * this.velocity.length() / 10;
                this.container.rotation.z = BABYLON.Vector3.Dot(this.velocity, right) / 20;
            }

            BABYLON.Vector3.TransformCoordinatesToRef(this._trailLeftLocalPos, this.instance.getWorldMatrix(), this.trailLeftPos);
            BABYLON.Vector3.TransformCoordinatesToRef(this._trailRightLocalPos, this.instance.getWorldMatrix(), this.trailRightPos);
        }
    }

    private _trailLeftLocalPos: BABYLON.Vector3 = new BABYLON.Vector3(-0.6, 0, -3.3);
    private _trailRightLocalPos: BABYLON.Vector3 = new BABYLON.Vector3(0.6, 0, -3.3);
    public trailLeftPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public trailRightPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
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
                new ShipTrail(this.trailLeftPos, this.instance, -1, scene);
                new ShipTrail(this.trailRightPos, this.instance, 1, scene);
                scene.registerBeforeRender(this._update);
                if (callback) {
                    callback();
                }
            }
        )
    }
}