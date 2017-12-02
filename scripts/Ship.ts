class Ship {

    public instance: BABYLON.AbstractMesh;

    constructor() {

    }

    public instantiate(scene: BABYLON.Scene, callback?: () => void): void {
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/ship.babylon",
            "",
            scene,
            (meshes) => {
                
            }
        )
    }
}