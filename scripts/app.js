class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.resize();
        this.light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
        this.light.intensity = 0.7;
        this.camera = new BABYLON.ArcRotateCamera("MenuCamera", Math.PI / 3, Math.PI / 3, 10, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    resize() {
        this.engine.resize();
    }
}
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
    let ship = new Ship();
    ship.instantiate(game.scene);
});
class Ship {
    constructor() {
    }
    instantiate(scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./data/ship.babylon", "", scene, (meshes) => {
        });
    }
}
