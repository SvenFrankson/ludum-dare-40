class FishNet {

    public instance: BABYLON.AbstractMesh;
    public ropeLeft: BABYLON.Mesh;
    public ropeRight: BABYLON.Mesh;
    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public protectedCaught: number = 0;

    constructor(public ship: Ship, public manager: AnimalManager) {

    }
    
    public instantiate(scene: BABYLON.Scene): void {
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/fishnet.babylon",
            "",
            scene,
            (meshes) => {
                this.instance = meshes[0];

                this.instance.position = this.ship.instance.position.subtract(this.ship.instance.getDirection(BABYLON.Axis.Z).scale(10));

                this.instance.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
                this.instance.renderOutline = true;
                this.instance.outlineColor = BABYLON.Color3.Black();
                this.instance.outlineWidth = 0.01;

                this.ropeLeft = BABYLON.MeshBuilder.CreateTube(
                    "RopeLeft",
                    {
                        path: [
                            BABYLON.Vector3.Zero(),
                            BABYLON.Vector3.One()
                        ],
                        radius: 0.05,
                        updatable: true
                    },
                    scene
                );
                this.ropeRight = BABYLON.MeshBuilder.CreateTube(
                    "RopeRight",
                    {
                        path: [
                            BABYLON.Vector3.Zero(),
                            BABYLON.Vector3.One()
                        ],
                        radius: 0.05,
                        updatable: true
                    },
                    scene
                );

                scene.registerBeforeRender(this._updateFishNet);
            }
        )
    }

    private _updateFishNet = () => {
        if (this.ship && this.instance) {
            let deltaTime: number = this.instance.getScene().getEngine().getDeltaTime();
            this.instance.position.y = this.ship.instance.position.y;
            let dir = this.ship.instance.position.subtract(this.instance.position);
            let delta = (dir.length() - 10) / 10;
            delta = Math.min(Math.max(delta, -1), 1);
            dir.normalize();

            this.velocity.scaleInPlace(0.99);
            this.velocity.addInPlace(dir.scale(delta / 2));
            this.instance.position.addInPlace(this.velocity.scale(deltaTime / 1000));

            this.instance.lookAt(this.ship.instance.position, Math.PI);

            let ropeLeftStart = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-3.37, 0, 0.62), this.instance.getWorldMatrix());
            let ropeRightStart = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(3.37, 0, 0.62), this.instance.getWorldMatrix());
            let ropeShipEnd = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 2.66, -3.6), this.ship.container.getWorldMatrix());

            BABYLON.MeshBuilder.CreateTube(
                "RopeLeft",
                {
                    path: [
                        ropeLeftStart,
                        ropeShipEnd
                    ],
                    radius: 0.05,
                    updatable: true,
                    instance: this.ropeLeft,
                },
                this.instance.getScene()
            );

            BABYLON.MeshBuilder.CreateTube(
                "RopeRight",
                {
                    path: [
                        ropeRightStart,
                        ropeShipEnd
                    ],
                    radius: 0.05,
                    updatable: true,
                    instance: this.ropeRight,
                },
                this.instance.getScene()
            );

            for (let i: number = 0; i < this.manager.animals.length; i++) {
                let a = this.manager.animals[i];
                if (a.instance) {
                    if (BABYLON.Vector3.DistanceSquared(this.instance.position, a.instance.position) < 9) {
                        this.protectedCaught += a.catch(this);
                    }
                }
            }
        }
    }
}