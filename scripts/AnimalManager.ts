class AnimalManager {

    public maxCount: number = 30;
    public maxDistance: number = 100;
    public protectedRate: number = 0.25;

    public animals: Animal[] = [];
    public protected: Protected[] = [];
    public fishable: Fishable[] = [];

    constructor(public ship: Ship, public scene: BABYLON.Scene) {
        scene.registerBeforeRender(this._updateAnimals);
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
        let t = new Turtle(this);
		let p = new BABYLON.Vector3(
			this.ship.instance.position.x + (Math.random() - 0.5) * 2 * this.maxDistance,
			- 2,
			this.ship.instance.position.z + (Math.random() - 0.5) * 2 * this.maxDistance
		);
        t.instantiate(p, this.scene);
        return t;
    }
    
    private _createFishable(): Fishable {
        let f = new Fish(this);
		let p = new BABYLON.Vector3(
			this.ship.instance.position.x + (Math.random() - 0.5) * 2 * this.maxDistance,
			- 2,
			this.ship.instance.position.z + (Math.random() - 0.5) * 2 * this.maxDistance
		);
        f.instantiate(p, this.scene);
        return f;
    }
}