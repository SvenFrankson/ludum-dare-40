class Main {

	public static instance: Main;
	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;
	public light: BABYLON.HemisphericLight;
	public camera: ShipCamera;
	public groundZero: BABYLON.Mesh;

	constructor(canvasElement: string) {
		Main.instance = this;
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
	game.camera = new ShipCamera("ShipCamera", ship, game.scene);

	ship.instantiate(
		game.scene
	);

	let shipControler = new ShipControler(ship, game.scene);

	for (let i: number = 0; i < 10; i++) {
		let t = new Animal("turtle");
		let p = new BABYLON.Vector3(
			(Math.random() - 0.5) * 2 * 42,
			- 2,
			(Math.random() - 0.5) * 2 * 42
		);
		t.instantiate(p, game.scene);
	}

	game.groundZero = BABYLON.MeshBuilder.CreateGround("GroundZero", {width: seaSize * 10, height: seaSize * 10}, game.scene);
	game.groundZero.isVisible = false;
});