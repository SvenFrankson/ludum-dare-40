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
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/" + this.name + ".babylon",
            "",
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
        this.instance.position.copyFromFloats(Math.random() * 2 - 2, 0, Math.random() * 2 - 2);
        this.manager.removeAnimal(this);
        return 1;
    }
}

class Turtle extends Protected {

    constructor(manager: AnimalManager) {
        super("turtle", manager);
    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        super.instantiate(position, scene, () => {
            let fishMaterial = new BABYLON.StandardMaterial("TurtleMaterial", scene);
            fishMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
            fishMaterial.specularColor.copyFromFloats(0, 0, 0);
            fishMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
            this.instance.material = fishMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("ArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}

abstract class Fishable extends Animal {

    public catch(fishnet: FishNet): number {
        this.dispose();
        return 0;
    }
}

class Fish extends Fishable {
    
    constructor(manager: AnimalManager) {
        super("fish", manager);
    }

    public instantiate(position: BABYLON.Vector3, scene: BABYLON.Scene, callback?: () => void) {
        super.instantiate(position, scene, () => {
            let fishMaterial = new BABYLON.StandardMaterial("FishMaterial", scene);
            fishMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
            fishMaterial.specularColor.copyFromFloats(0, 0, 0);
            fishMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
            this.instance.material = fishMaterial;
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