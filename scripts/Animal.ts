abstract class Animal {

    public instance: BABYLON.AbstractMesh;

    constructor(public name: string, public manager: AnimalManager) {

    }

    public abstract catch(fishnet: FishNet): number;

    public dispose(): void {
        this.manager.removeAnimal(this);
        if (this.instance) {
            this.instance.dispose();
        }
    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        if (this.manager.datas.get(this.name)) {
            BABYLON.SceneLoader.ImportMesh(
                "",
                "",
                "data:" + this.manager.datas.get(this.name),
                scene,
                (meshes) => {
                    this.instance = meshes[0];
                    this.instance.position = position;
                    scene.registerBeforeRender(this._update);
                    if (callback) {
                        callback();
                    }
                }
            )
        } else {
            this.dispose();
        }
    }

    private dir: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    private targetDir: BABYLON.Vector3 = BABYLON.Vector3.Right();
    protected _update = () => {
        this.dir = this.instance.getDirection(BABYLON.Axis.Z);
        let alpha = LDMath.AngleFromToAround(this.dir, this.targetDir, BABYLON.Axis.Y);
        if (Math.abs(alpha) > Math.PI / 64) {
            this.dir = BABYLON.Vector3.Lerp(this.dir, this.targetDir, 0.001).normalize();
            this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), 0.01));
            this.instance.translate(BABYLON.Axis.Z, 0.1);
        } else {
            this.targetDir = new BABYLON.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }
    }
}

class Protected extends Animal {

    public catch(fishnet: FishNet): number {
        Main.instance.scene.unregisterBeforeRender(this._update);
        this.instance.parent = fishnet.instance;
        this.instance.position.copyFromFloats(Math.random() * 2 - 2, - Math.random() - 1, Math.random() * 2 - 2);
        this.manager.removeAnimal(this);
        return 1;
    }
}

class Turtle extends Protected {

    constructor(manager: AnimalManager) {
        super("turtle", manager);
    }
    
    public catch(fishnet: FishNet): number {
        Main.instance.score -= 100;
        Main.instance.turtles++;
        return super.catch(fishnet);
    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.turtleMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("TurtleArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}

class Tuna extends Protected {

    constructor(manager: AnimalManager) {
        super("tuna", manager);
    }
    
    public catch(fishnet: FishNet): number {
        Main.instance.score -= 50;
        Main.instance.tunas++;
        setTimeout(
            () => {
                this.dispose();
                fishnet.protectedCaught--;
            },
            10000
        );
        return super.catch(fishnet);
    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.tunaMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("TunaArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}

abstract class Fishable extends Animal {

    public catch(fishnet: FishNet): number {
        Main.instance.scene.unregisterBeforeRender(this._update);
        this.instance.parent = fishnet.instance;
        this.instance.position.copyFromFloats(Math.random() * 3 - 3, - Math.random() - 1, Math.random() * 3 - 3);
        this.manager.removeAnimal(this);
        return 1;
    }
}

class Herring extends Fishable {
    
    constructor(manager: AnimalManager) {
        super("fish", manager);
    }

    public catch(fishnet: FishNet): number {
        Main.instance.score += 25;
        Main.instance.timer += 3;
        Main.instance.herrings++;
        setTimeout(
            () => {
                this.dispose();
                fishnet.protectedCaught--;
            },
            3000
        );
        return super.catch(fishnet);
    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.fishMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("FishArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}

class Cod extends Fishable {
    constructor(manager: AnimalManager) {
        super("cod", manager);
    }
    
    public catch(fishnet: FishNet): number {
        Main.instance.score += 50;
        Main.instance.timer += 5;
        Main.instance.cods++;
        setTimeout(
            () => {
                this.dispose();
                fishnet.protectedCaught--;
            },
            5000
        );
        return super.catch(fishnet);
    }
    
    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.fishMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("CodArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}