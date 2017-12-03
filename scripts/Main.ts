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
	private _score: number = 0;
	public get score(): number {
		return this._score;
	}
	public set score(v: number) {
		this._score = v;
		$("#score").text(this.score.toFixed(0));
		$("#score-count").text(this.score.toFixed(0));
	}
	public timer = 0;
	
	private _herrings: number = 0;
	public get herrings(): number {
		return this._herrings;
	}
	public set herrings(v: number) {
		this._herrings = v;
		$("#herrings-count").text((this.herrings).toFixed(0));
		$("#herrings-score").text((this.herrings * 25).toFixed(0));
	}

	private _cods: number = 0;
	public get cods(): number {
		return this._cods;
	}
	public set cods(v: number) {
		this._cods = v;
		$("#cods-count").text((this.cods).toFixed(0));
		$("#cods-score").text((this.cods * 50).toFixed(0));
	}

	private _tunas: number = 0;
	public get tunas(): number {
		return this._tunas;
	}
	public set tunas(v: number) {
		this._tunas = v;
		$("#tunas-count").text((this.tunas).toFixed(0));
		$("#tunas-score").text((this.tunas * - 50).toFixed(0));
	}

	private _turtles: number = 0;
	public get turtles(): number {
		return this._turtles;
	}
	public set turtles(v: number) {
		this._turtles = v;
		$("#turtles-count").text((this.turtles).toFixed(0));
		$("#turtles-score").text((this.turtles * - 100).toFixed(0));
	}

	public fishMaterial: BABYLON.StandardMaterial;
	public codMaterial: BABYLON.StandardMaterial;
	public turtleMaterial: BABYLON.StandardMaterial;
	public tunaMaterial: BABYLON.StandardMaterial;
	public seaBottomMaterial: BABYLON.StandardMaterial;

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
			this.timer -= this.engine.getDeltaTime() / 1000;
			if (this.playing && this.timer < 0) {
				this.gameOver();
			}
			$("#time").text(this.timer.toFixed(0));
		});
	}

	public resize(): void {
		this.engine.resize();
	}

	public playButtonClic(): void {
		$("#gui").fadeOut(600, undefined, () => {
			this.score = 0;
			this.timer = 30;
			$("#in-game").fadeIn(300, undefined, () => {
				this.playing = true;
				$("#message-1").fadeIn(300, undefined, () => {
					setTimeout(
						() => {
							$("#message-2").fadeIn(300, undefined, () => {
								$("#message-1").fadeOut(300);
								setTimeout(
									() => {
										$("#message-3").fadeIn(300, undefined, () => {
											$("#message-2").fadeOut(300);
											setTimeout(
												() => {
													$("#message-3").fadeOut(300);
												},
												2300
											);
										});
									},
									2000
								);
							});
						},
						2000
					);
				});
			});
		})
	}

	public gameOver(): void {
		$("#in-game").fadeOut(600, undefined, () => {
			$("#game-over-menu").fadeIn(600, undefined, () => {
				this.playing = false;
			});
		})
	}
}


window.addEventListener("DOMContentLoaded", () => {
	let game: Main = new Main("render-canvas");
	game.createScene();
	game.animate();

	game.fishMaterial = new BABYLON.StandardMaterial("FishMaterial", game.scene);
	game.fishMaterial.diffuseColor = BABYLON.Color3.FromHexString("#4aa9d6");
	game.fishMaterial.specularColor.copyFromFloats(0, 0, 0);
	game.fishMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
	
	game.turtleMaterial = new BABYLON.StandardMaterial("TurtleMaterial", game.scene);
	game.turtleMaterial.diffuseColor = BABYLON.Color3.FromHexString("#4ad658");
	game.turtleMaterial.specularColor.copyFromFloats(0, 0, 0);
	game.turtleMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
		
	game.tunaMaterial = new BABYLON.StandardMaterial("TunaMaterial", game.scene);
	game.tunaMaterial.diffuseColor = BABYLON.Color3.FromHexString("#d64a78");
	game.tunaMaterial.specularColor.copyFromFloats(0, 0, 0);
	game.tunaMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);

	game.seaBottomMaterial = new BABYLON.StandardMaterial("SeaBottomMaterial", game.scene);
	game.seaBottomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#000000");
	game.seaBottomMaterial.specularColor.copyFromFloats(0, 0, 0);
	game.seaBottomMaterial.emissiveColor = BABYLON.Color3.FromHexString("#191919");

	$("#play-button").on("click", () => {
		game.playButtonClic();
	});

	$("#replay-button").on("click", () => {
		location.reload();
	});
	
	$("#share-button").on("click", () => {
		let tweet = "I just scored " + game.score + " on 'SomeFin In The Way' ! Try to beat me here #LDJAM";
		window.open("https://twitter.com/intent/tweet?text=" + tweet);
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