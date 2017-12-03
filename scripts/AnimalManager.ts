class AnimalManager {

    public maxCount: number = 30;
    public maxDistance: number = 100;
    public protectedRate: number = 0.25;

    public animals: Animal[] = [];
    public protected: Protected[] = [];
    public fishable: Fishable[] = [];

    public datas: Map<string, string> = new Map<string, string>();
    public loaded: boolean = false;

    constructor(public ship: Ship, public scene: BABYLON.Scene) {
        scene.registerBeforeRender(this._updateAnimals);
    }

    public loadData(): void {
        $.get(
            "./data/fish.babylon",
            "",
            (content: string) => {
                this.datas.set("fish", content);
                $.get(
                    "./data/cod.babylon",
                    "",
                    (content: string) => {
                        this.datas.set("cod", content);
                        $.get(
                            "./data/tuna.babylon",
                            "",
                            (content: string) => {
                                this.datas.set("tuna", content);
                                $.get(
                                    "./data/turtle.babylon",
                                    "",
                                    (content: string) => {
                                        this.datas.set("turtle", content);
                                        this.loaded = true;
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }

    private addAnimal(animal: Animal) {
        this.animals.push(animal);
        if (animal instanceof Turtle) {
            this.protected.push(animal);
        } else {
            this.fishable.push(animal);
        }
        $("#animal-count").text(this.animals.length + "");
        $("#protected-count").text(this.protected.length + "");
        $("#fishable-count").text(this.fishable.length + "");
    }
    
    public removeAnimal(animal: Animal) {
        let index = this.animals.indexOf(animal);
        if (index !== -1) {
            this.animals.splice(index, 1);
        }
        if (animal instanceof Turtle) {
            index = this.protected.indexOf(animal);
            if (index !== -1) {
                this.protected.splice(index, 1);
            }
        } else {
            index = this.fishable.indexOf(animal);
            if (index !== -1) {
                this.fishable.splice(index, 1);
            }
        }
        $("#animal-count").text(this.animals.length + "");
        $("#protected-count").text(this.protected.length + "");
        $("#fishable-count").text(this.fishable.length + "");
    }

    private _updateAnimals = () => {
        if (!this.loaded) {
            return;
        }
        let pCreation = 1 - this.animals.length / this.maxCount;

        let p: number = Math.random();
        if (p < pCreation) {
            this._createAnimal();
        }

        let sqrDist = this.maxDistance * this.maxDistance * 1.2;
        for (let i: number = 0; i < this.animals.length; i++) {
            if (this.animals[i].instance) {
                let sqrD = BABYLON.Vector3.DistanceSquared(this.animals[i].instance.position, this.ship.instance.position);
                if (sqrD > sqrDist) {
                    this.animals[i].dispose();
                }
            }
        }
    }

    private _createAnimal(): void {
        let ratioProtected: number = this.protected.length / this.animals.length;
        let ratioFishable: number = this.fishable.length / this.animals.length;

        let probabiltyFishable: number = Math.sqrt(ratioProtected);
        let probabilityProtected: number = 1 - probabiltyFishable;
        probabilityProtected = probabilityProtected / 2;

        let p: number = Math.random();
        if (p < probabilityProtected) {
            this.addAnimal(this._createProtected());
        } else {
            this.addAnimal(this._createFishable());
        }
    }

    private _createProtected(): Protected {
        let pr: Protected;
        let r = Math.random();
        if (r < 0.5) {
            pr = new Turtle(this);
        } else {
            pr = new Tuna(this);
        }
		let p = new BABYLON.Vector3(
			this.ship.instance.position.x + (Math.random() - 0.5) * 2 * this.maxDistance,
			- 2,
			this.ship.instance.position.z + (Math.random() - 0.5) * 2 * this.maxDistance
		);
        pr.instantiate(p, this.scene);
        return pr;
    }
    
    private _createFishable(): Fishable {
        let f: Fishable;
        let r = Math.random();
        if (r < 0.5) {
            f = new Herring(this);
        } else {
            f = new Cod(this);
        }
		let p = new BABYLON.Vector3(
			this.ship.instance.position.x + (Math.random() - 0.5) * 2 * this.maxDistance,
			- 2,
			this.ship.instance.position.z + (Math.random() - 0.5) * 2 * this.maxDistance
		);
        f.instantiate(p, this.scene);
        return f;
    }
}