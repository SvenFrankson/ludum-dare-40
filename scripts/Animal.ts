class Animal {

    public instance: BABYLON.AbstractMesh;

    constructor(public name: string) {

    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene) {
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/" + this.name + ".babylon",
            "",
            scene,
            (meshes) => {
                this.instance = meshes[0];
                this.instance.position = position;
                this.instance.material = new BABYLON.StandardMaterial("Test", scene);
                this.instance.material.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
                this.instance.material.specularColor.copyFromFloats(0, 0, 0);
                this.instance.material.emissiveColor.copyFromFloats(0.2, 0.2, 0.2);
                this.instance.renderOutline = true;
                this.instance.outlineColor = BABYLON.Color3.Black();
                this.instance.outlineWidth = 0.04;
                this.instance.skeleton.beginAnimation("FishArmatureAction", true);

                scene.registerBeforeRender(this._update);
            }
        )
    }

    private dir: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    private targetDir: BABYLON.Vector3 = BABYLON.Vector3.Right();
    private _update = () => {
        this.dir = this.instance.getDirection(BABYLON.Axis.Z);
        let alpha = LDMath.AngleFromToAround(this.dir, this.targetDir, BABYLON.Axis.Y);
        if (Math.abs(alpha) > Math.PI / 64) {
            this.dir = BABYLON.Vector3.Lerp(this.dir, this.targetDir, 0.001).normalize();
            this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), 0.01));
            this.instance.translate(BABYLON.Axis.Z, 0.1);
        } else {
            this.targetDir = new BABYLON.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }
    }
}