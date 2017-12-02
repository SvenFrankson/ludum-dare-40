class Ship {

    public instance: BABYLON.AbstractMesh;
    public sea: Sea;

    constructor(sea: Sea) {
        this.sea = sea;
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
                scene.registerBeforeRender(
                    () => {
                        this.instance.position.y = this.sea.evaluate(this.instance.position.x, this.instance.position.z);
                    }
                );
            }
        )
    }
}