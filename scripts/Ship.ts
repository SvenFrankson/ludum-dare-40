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
                meshes.forEach(
                    (m) => {
                        m.material = new ToonMaterial("ToonMaterial", scene);
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.Black();
                        m.outlineWidth = 0.01;
                    }
                )
            }
        )
    }
}