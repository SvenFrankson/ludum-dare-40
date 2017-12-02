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
    let seaSize = 64;
    let sea = new Sea(seaSize);
    sea.instantiate(game.scene);
    let ship = new Ship(sea);
    ship.instantiate(game.scene, () => {
        game.camera.setTarget(ship.instance);
    });
    let shipControler = new ShipControler(ship, game.scene);
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
        this._update = () => {
            this.time = (new Date()).getTime() / 1000;
            let positions = [];
            let indices = [];
            for (let j = 0; j <= this.size; j++) {
                for (let i = 0; i <= this.size; i++) {
                    let h = this.wavesSum(i, j, this.time);
                    positions.push(i, h, j);
                    this.heightMap[i][j] = h;
                }
            }
            let s = this.size;
            let s1 = this.size + 1;
            for (let j = 0; j < this.size; j++) {
                for (let i = 0; i < this.size; i++) {
                    indices.push(i + j * s1, i + (j + 1) * s1, (i + 1) + j * s1);
                    indices.push(i + (j + 1) * s1, (i + 1) + (j + 1) * s1, (i + 1) + j * s1);
                }
            }
            this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true, false);
        };
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
        let seaMaterial = new BABYLON.StandardMaterial("SeaMaterial", scene);
        seaMaterial.specularColor.copyFromFloats(0, 0, 0);
        seaMaterial.wireframe = true;
        this.mesh = new BABYLON.Mesh("Sea", scene);
        this.mesh.material = seaMaterial;
        let positions = [];
        let indices = [];
        for (let j = 0; j <= this.size; j++) {
            for (let i = 0; i <= this.size; i++) {
                positions.push(i, 0, j);
            }
        }
        let s = this.size;
        let s1 = this.size + 1;
        for (let j = 0; j < this.size; j++) {
            for (let i = 0; i < this.size; i++) {
                indices.push(i + (j + 1) * s1, i + j * s1, (i + 1) + j * s1);
                indices.push((i + 1) + (j + 1) * s1, i + (j + 1) * s1, (i + 1) + j * s1);
            }
        }
        let data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.applyToMesh(this.mesh, true);
        scene.registerBeforeRender(this._update);
    }
    wavesSum(x, y, t) {
        let s = 0;
        for (let i = 0; i < this.waves.length; i++) {
            s += this.waves[i].evaluate(x, y, t);
        }
        return s;
    }
    evaluate(x, y) {
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
                targetSpeed = Math.min(Math.max(targetSpeed, 0), 5);
                this.speed = BABYLON.Scalar.Lerp(this.speed, targetSpeed, 0.1);
                this.instance.position.x += forward.x * deltaTime / 1000 * this.speed;
                this.instance.position.z += forward.z * deltaTime / 1000 * this.speed;
                this.instance.position.y = this.sea.evaluate(this.instance.position.x, this.instance.position.z);
                let alpha = LDMath.AngleFromToAround(forward, dir, BABYLON.Axis.Y);
                if (this.debugDir) {
                    this.debugDir.dispose();
                }
                this.debugDir = BABYLON.RayHelper.CreateAndShow(new BABYLON.Ray(this.instance.position, dir, 10), this.instance.getScene(), BABYLON.Color3.Blue());
                if (this.debugZ) {
                    this.debugZ.dispose();
                }
                this.debugZ = BABYLON.RayHelper.CreateAndShow(new BABYLON.Ray(this.instance.position, forward, 10), this.instance.getScene(), BABYLON.Color3.Red());
                if (isFinite(alpha)) {
                    this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), Math.PI / 8 * deltaTime / 1000));
                }
            }
        };
        this.sea = sea;
    }
    instantiate(scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./data/ship.babylon", "", scene, (meshes) => {
            this.instance = new BABYLON.Mesh("Ship", scene);
            meshes.forEach((m) => {
                m.material = new ToonMaterial("ToonMaterial", scene);
                m.renderOutline = true;
                m.outlineColor = BABYLON.Color3.Black();
                m.outlineWidth = 0.01;
                m.parent = this.instance;
            });
            scene.registerBeforeRender(this._update);
            if (callback) {
                callback();
            }
        });
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
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
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
