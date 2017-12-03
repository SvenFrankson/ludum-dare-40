class Main {

	public static instance: Main;
	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;
	public light: BABYLON.HemisphericLight;
	public camera: ShipCamera;
	public groundZero: BABYLON.Mesh;
	public playing: boolean = false;
	public pointerDown: boolean = false;

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

	public playButtonClic(): void {
		$("#gui").fadeOut(1000, undefined, () => {
			this.playing = true;
		})
	}
}


window.addEventListener("DOMContentLoaded", () => {
	let game: Main = new Main("render-canvas");
	game.createScene();
	game.animate();

	$("#play-button").on("click", () => {
		game.playButtonClic();
	});

	game.canvas.addEventListener("pointerdown", () => {
		game.pointerDown = true;
	})

	game.canvas.addEventListener("pointerout", () => {
		game.pointerDown = false;
	})

	document.addEventListener("pointerup", () => {
		game.pointerDown = false;
	})
	
	let seaSize = 64;
	let sea = new Sea(seaSize);
	sea.instantiate(game.scene);

	let ship = new Ship(sea);
	game.camera = new ShipCamera("ShipCamera", ship, game.scene);

	ship.instantiate(
		game.scene,
		() => {
			let shipControler = new ShipControler(ship, game.scene);
			let manager = new AnimalManager(ship, game.scene);
			ship.fishnet = new FishNet(ship, manager);
			ship.fishnet.instantiate(game.scene);
		}
	);

	game.groundZero = BABYLON.MeshBuilder.CreateGround("GroundZero", {width: seaSize * 10, height: seaSize * 10}, game.scene);
	game.groundZero.isVisible = false;
});