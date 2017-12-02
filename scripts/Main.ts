class Main {

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;
	public light: BABYLON.HemisphericLight;
	public camera: BABYLON.ArcRotateCamera;

	constructor(canvasElement: string) {
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		this.engine = new BABYLON.Engine(this.canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}
	
	createScene(): void {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor.copyFromFloats(1, 1, 1, 1);
		this.resize();

		this.light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
		this.light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
		this.light.intensity = 0.7;

		this.camera = new BABYLON.ArcRotateCamera("MenuCamera", Math.PI/3, Math.PI / 3, 10, BABYLON.Vector3.Zero(), this.scene);
		this.camera.attachControl(this.canvas);
	}

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	public resize(): void {
		this.engine.resize();
	}
}


window.addEventListener("DOMContentLoaded", () => {
	let game: Main = new Main("render-canvas");
	game.createScene();
	game.animate();
	
	let seaSize = 64;
	let sea = new Sea(seaSize);
	sea.instantiate(game.scene);

	let ship = new Ship(sea);
	ship.instantiate(game.scene);
});