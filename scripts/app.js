class Animal {
    constructor(name) {
        this.name = name;
        this.dir = BABYLON.Vector3.Forward();
        this.targetDir = BABYLON.Vector3.Right();
        this._update = () => {
            this.dir = this.instance.getDirection(BABYLON.Axis.Z);
            let alpha = LDMath.AngleFromToAround(this.dir, this.targetDir, BABYLON.Axis.Y);
            if (Math.abs(alpha) > Math.PI / 64) {
                this.dir = BABYLON.Vector3.Lerp(this.dir, this.targetDir, 0.001).normalize();
                this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), 0.01));
                this.instance.translate(BABYLON.Axis.Z, 0.1);
            }
            else {
                this.targetDir = new BABYLON.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }
        };
    }
    instantiate(position, scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./data/" + this.name + ".babylon", "", scene, (meshes) => {
            this.instance = meshes[0];
            this.instance.position = position;
            scene.registerBeforeRender(this._update);
            if (callback) {
                callback();
            }
        });
    }
}
class Turtle extends Animal {
    constructor() {
        super("turtle");
    }
    instantiate(position, scene, callback) {
        super.instantiate(position, scene, () => {
            let fishMaterial = new BABYLON.StandardMaterial("TurtleMaterial", scene);
            fishMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
            fishMaterial.specularColor.copyFromFloats(0, 0, 0);
            fishMaterial.emissiveColor.copyFromFloats(0.4, 0.4, 0.4);
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
class Fish extends Animal {
    constructor() {
        super("fish");
    }
    instantiate(position, scene, callback) {
        super.instantiate(position, scene, () => {
            let fishMaterial = new BABYLON.StandardMaterial("FishMaterial", scene);
            fishMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
            fishMaterial.specularColor.copyFromFloats(0, 0, 0);
            fishMaterial.emissiveColor.copyFromFloats(0.4, 0.4, 0.4);
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
class Main {
    constructor(canvasElement) {
        Main.instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(1, 1, 1, 1);
        this.resize();
        this.light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
        this.light.intensity = 0.7;
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
    let seaSize = 64;
    let sea = new Sea(seaSize);
    sea.instantiate(game.scene);
    let ship = new Ship(sea);
    game.camera = new ShipCamera("ShipCamera", ship, game.scene);
    ship.instantiate(game.scene);
    let shipControler = new ShipControler(ship, game.scene);
    for (let i = 0; i < 10; i++) {
        let t = new Turtle();
        let p = new BABYLON.Vector3((Math.random() - 0.5) * 2 * 6, -2, (Math.random() - 0.5) * 2 * 6);
        t.instantiate(p, game.scene);
    }
    for (let i = 0; i < 10; i++) {
        let f = new Fish();
        let p = new BABYLON.Vector3((Math.random() - 0.5) * 2 * 6, -2, (Math.random() - 0.5) * 2 * 6);
        f.instantiate(p, game.scene);
    }
    game.groundZero = BABYLON.MeshBuilder.CreateGround("GroundZero", { width: seaSize * 10, height: seaSize * 10 }, game.scene);
    game.groundZero.isVisible = false;
});
class LDMath {
    static IsNanOrZero(n) {
        return isNaN(n) || n === 0;
    }
    static ProjectPerpendicularAtToRef(v, at, ref) {
        if (v && at) {
            let k = BABYLON.Vector3.Dot(v, at);
            k = k / at.lengthSquared();
            if (isFinite(k)) {
                ref.copyFrom(v);
                ref.subtractInPlace(at.scale(k));
            }
        }
    }
    static ProjectPerpendicularAt(v, at) {
        let out = BABYLON.Vector3.Zero();
        LDMath.ProjectPerpendicularAtToRef(v, at, out);
        return out;
    }
    static Angle(from, to) {
        return Math.acos(BABYLON.Vector3.Dot(from, to) / from.length() / to.length());
    }
    static AngleFromToAround(from, to, around, onlyPositive = false) {
        let pFrom = LDMath.ProjectPerpendicularAt(from, around).normalize();
        if (LDMath.IsNanOrZero(pFrom.lengthSquared())) {
            return NaN;
        }
        let pTo = LDMath.ProjectPerpendicularAt(to, around).normalize();
        if (LDMath.IsNanOrZero(pTo.lengthSquared())) {
            return NaN;
        }
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            if (onlyPositive) {
                angle = 2 * Math.PI - angle;
            }
            else {
                angle = -angle;
            }
        }
        return angle;
    }
}
class Sea {
    constructor(size) {
        this.size = 0;
        this.time = 0;
        this.size = size;
        this.heightMap = [];
        for (let i = 0; i <= this.size; i++) {
            this.heightMap[i] = [];
        }
        this.waves = [];
        for (let i = 0; i < 6; i++) {
            this.waves.push(new Wave(Math.random() / 4, Math.random() / 1, 5 * Math.random(), new BABYLON.Vector2(Math.random(), Math.random()).normalize()));
        }
    }
    instantiate(scene) {
        this.mesh = BABYLON.MeshBuilder.CreateGround("Sea", { width: 2048, height: 2048, subdivisions: 1 }, scene);
        this.mesh.material = new SeaMaterial("SeaMaterial", scene);
        let bottom = BABYLON.MeshBuilder.CreateGround("Sea", { width: 2048, height: 2048, subdivisions: 1 }, scene);
        bottom.position.y = -5;
        let bottomMaterial = new BABYLON.StandardMaterial("BottomMaterial", scene);
        bottomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#7ee5f7");
        bottomMaterial.specularColor.copyFromFloats(0, 0, 0);
        bottom.material = bottomMaterial;
    }
    wavesSum(x, y, t) {
        let s = 0;
        for (let i = 0; i < this.waves.length; i++) {
            s += this.waves[i].evaluate(x, y, t);
        }
        return s;
    }
    evaluate(x, y) {
        return 0;
        /*
        let h = 0;

        let i = Math.floor(x);
        let i1 = i + 1;
        let dx = x - i;
        let j = Math.floor(y);
        let j1 = j + 1;
        let dy = y - j;

        let hX0 = BABYLON.Scalar.Lerp(this.wavesSum(i, j, this.time), this.wavesSum(i1, j, this.time), dx);
        let hX1 = BABYLON.Scalar.Lerp(this.wavesSum(i, j1, this.time), this.wavesSum(i1, j1, this.time), dx);

        return BABYLON.Scalar.Lerp(hX0, hX1, dy);
        */
    }
}
class SeaMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "sea",
            fragment: "sea",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
            needAlphaBlending: true
        });
        this.t = 0;
        this.dir0 = BABYLON.Vector2.Zero();
        this.dir1 = BABYLON.Vector2.Zero();
        this.dir2 = BABYLON.Vector2.Zero();
        this.dir3 = BABYLON.Vector2.Zero();
        this.dir4 = BABYLON.Vector2.Zero();
        this.dir5 = BABYLON.Vector2.Zero();
        this.dir6 = BABYLON.Vector2.Zero();
        this._updateTime = () => {
            this.setFloat("time", this.t++ / 60);
        };
        this.dir0 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir1 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir2 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir3 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir4 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir5 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir6 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.setVector2("dir0", this.dir0);
        this.setVector2("dir1", this.dir1);
        this.setVector2("dir2", this.dir2);
        this.setVector2("dir3", this.dir3);
        this.setVector2("dir4", this.dir4);
        this.setVector2("dir5", this.dir5);
        this.setVector2("dir6", this.dir6);
        this.setFloat("a0", 1 / 7);
        this.setFloat("a1", 1 / 7);
        this.setFloat("a2", 1 / 7);
        this.setFloat("a3", 1 / 7);
        this.setFloat("a4", 1 / 7);
        this.setFloat("a5", 1 / 7);
        this.setFloat("a6", 1 / 7);
        scene.registerBeforeRender(this._updateTime);
    }
}
class Ship {
    constructor(sea) {
        this.target = BABYLON.Vector3.Zero();
        this.speed = 0;
        this._update = () => {
            if (this.instance) {
                let deltaTime = this.instance.getScene().getEngine().getDeltaTime();
                let dir = this.target.subtract(this.instance.position);
                let forward = this.instance.getDirection(BABYLON.Axis.Z);
                let targetSpeed = BABYLON.Vector3.Distance(this.target, this.instance.position) / 10 * 5;
                targetSpeed = Math.min(Math.max(targetSpeed, 0), 10);
                this.speed = BABYLON.Scalar.Lerp(this.speed, targetSpeed, 0.005);
                this.instance.position.x += forward.x * deltaTime / 1000 * this.speed;
                this.instance.position.z += forward.z * deltaTime / 1000 * this.speed;
                this.instance.position.y = this.sea.evaluate(this.instance.position.x, this.instance.position.z);
                let alpha = LDMath.AngleFromToAround(forward, dir, BABYLON.Axis.Y);
                /*
                if (this.debugDir) {
                    this.debugDir.dispose();
                   
                }
                this.debugDir = BABYLON.RayHelper.CreateAndShow(
                    new BABYLON.Ray(this.instance.position, dir, 10), this.instance.getScene(), BABYLON.Color3.Blue()
                );
                if (this.debugZ) {
                    this.debugZ.dispose();
                }
                this.debugZ = BABYLON.RayHelper.CreateAndShow(
                    new BABYLON.Ray(this.instance.position, forward, 10), this.instance.getScene(), BABYLON.Color3.Red()
                );
                */
                if (isFinite(alpha)) {
                    this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), Math.PI / 8 * deltaTime / 1000));
                    this.container.rotation.x = -Math.PI / 16 * this.speed / 10;
                    this.container.rotation.z = Math.sign(alpha) * Math.min(Math.abs(alpha) / 2, Math.PI / 16);
                }
            }
        };
        this.sea = sea;
    }
    instantiate(scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./data/ship.babylon", "", scene, (meshes) => {
            this.instance = new BABYLON.Mesh("Ship", scene);
            this.container = new BABYLON.Mesh("Container", scene);
            this.container.parent = this.instance;
            meshes.forEach((m) => {
                m.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
                m.renderOutline = true;
                m.outlineColor = BABYLON.Color3.Black();
                m.outlineWidth = 0.01;
                m.parent = this.container;
            });
            new ShipTrail(this.instance.position, this.instance, 0.6, scene);
            new ShipTrail(this.instance.position, this.instance, -0.6, scene);
            scene.registerBeforeRender(this._update);
            if (callback) {
                callback();
            }
        });
    }
}
class ShipCamera extends BABYLON.FreeCamera {
    constructor(name, ship, scene) {
        super(name, BABYLON.Vector3.Zero(), scene);
        this.smoothness = 60;
        this._update = () => {
            if (this.ship && this.ship.instance) {
                let targetPos = this.ship.instance.position.clone();
                targetPos.y = 3;
                let cameraPos = this.ship.instance.getDirection(BABYLON.Axis.Z);
                cameraPos.y = 0;
                cameraPos.scaleInPlace(-20);
                cameraPos.addInPlace(new BABYLON.Vector3(0, 20, 0));
                cameraPos.x += this.ship.instance.position.x;
                cameraPos.z += this.ship.instance.position.z;
                this.position = BABYLON.Vector3.Lerp(this.position, cameraPos, 1 / this.smoothness);
                this.update();
                this.setTarget(targetPos);
            }
        };
        this.ship = ship;
        scene.registerBeforeRender(this._update);
    }
}
class ShipControler {
    constructor(ship, scene) {
        this._checkInputs = () => {
            let pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => {
                return mesh === Main.instance.groundZero;
            });
            if (pickInfo.hit) {
                this.ship.target.copyFrom(pickInfo.pickedPoint);
            }
        };
        this.ship = ship;
        this.scene = scene;
        this.scene.registerBeforeRender(this._checkInputs);
    }
}
class ShipTrail extends BABYLON.Mesh {
    constructor(origin, target, normalLength, scene) {
        super("ShipTrail", scene);
        this.origin = origin;
        this.target = target;
        this.normalLength = normalLength;
        this.length = 300;
        this.points = [];
        this.normals = [];
        this._updateTrail = () => {
            this.points.push(this.origin.clone());
            this.points.splice(0, 1);
            this.normals.push(this.target.getDirection(BABYLON.Axis.X).scaleInPlace(0.2));
            this.normals.splice(0, 1);
            let positions = [];
            for (let i = 0; i < this.points.length; i++) {
                this.points[i].x += this.normalLength * this.normals[i].x / 3;
                this.points[i].y += this.normalLength * this.normals[i].y / 3;
                this.points[i].z += this.normalLength * this.normals[i].z / 3;
                positions.push(this.points[i].x + this.normals[i].x * i / this.length, this.points[i].y + this.normals[i].y * i / this.length, this.points[i].z + this.normals[i].z * i / this.length);
                positions.push(this.points[i].x - this.normals[i].x * i / this.length, this.points[i].y - this.normals[i].y * i / this.length, this.points[i].z - this.normals[i].z * i / this.length);
            }
            console.log(positions.length);
            this.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false);
            this.computeWorldMatrix(true);
            this.refreshBoundingInfo();
        };
        this.position.y = 0.1;
        this.points = [];
        this.normals = [];
        for (let i = 0; i < this.length; i++) {
            this.points.push(origin.clone());
            this.normals.push(target.getDirection(BABYLON.Axis.X).scaleInPlace(normalLength));
        }
        this.initialize();
        scene.registerBeforeRender(this._updateTrail);
    }
    initialize() {
        let positions = [];
        let indices = [];
        let data = new BABYLON.VertexData();
        for (let i = 0; i < this.points.length; i++) {
            positions.push(this.points[i].x, this.points[i].y, this.points[i].z);
            positions.push(this.points[i].x, this.points[i].y, this.points[i].z);
        }
        for (let i = 0; i < this.points.length - 1; i++) {
            indices.push(2 * i, 2 * i + 1, 2 * i + 3);
            indices.push(2 * i, 2 * i + 3, 2 * i + 2);
            indices.push(2 * i, 2 * i + 3, 2 * i + 1);
            indices.push(2 * i, 2 * i + 2, 2 * i + 3);
        }
        data.positions = positions;
        data.indices = indices;
        data.applyToMesh(this, true);
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, color, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this._updateCameraPosition = () => {
            let camera = this.getScene().activeCamera;
            if (camera && camera.position) {
                this.setVector3("cameraPosition", camera.position);
            }
        };
        scene.registerBeforeRender(this._updateCameraPosition);
        this.setColor3("color", color);
    }
}
class Wave {
    constructor(amplitude, speed, period, direction) {
        this.amplitude = amplitude;
        this.speed = speed;
        this.period = period;
        this.direction = direction;
        this._evaluatePos = BABYLON.Vector2.Zero();
    }
    evaluate(x, y, t) {
        let v = 0;
        this._evaluatePos.x = x;
        this._evaluatePos.y = y;
        let d = BABYLON.Vector2.Dot(this._evaluatePos, this.direction);
        v = (Math.sin(d + (t * this.speed) * this.period) + Math.sin(d + (t * this.speed / 2) * this.period)) * this.amplitude;
        return v;
    }
}
