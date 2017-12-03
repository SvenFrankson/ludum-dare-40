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
                this.instance.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
                this.instance.renderOutline = true;
                this.instance.outlineColor = BABYLON.Color3.Black();
                this.instance.outlineWidth = 0.03;
            }
        )
    }
}