class Main {
    constructor(canvasElement) {
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
    let ship = new Ship();
    ship.instantiate(game.scene);
    let seaSize = 128;
    let sea = new Sea(seaSize);
    sea.instantiate(game.scene);
});
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
        this.mesh.position.x = -this.size / 2;
        this.mesh.position.z = -this.size / 2;
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
        let hX0 = BABYLON.Scalar.Lerp(this.heightMap[i][j], this.heightMap[i1][j], dx);
        let hX1 = BABYLON.Scalar.Lerp(this.heightMap[i][j1], this.heightMap[i1][j1], dx);
        return BABYLON.Scalar.Lerp(hX0, hX1, dy);
    }
}
class Ship {
    constructor() {
    }
    instantiate(scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./data/ship.babylon", "", scene, (meshes) => {
            meshes.forEach((m) => {
                m.material = new ToonMaterial("ToonMaterial", scene);
                m.renderOutline = true;
                m.outlineColor = BABYLON.Color3.Black();
                m.outlineWidth = 0.01;
            });
        });
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
        v = Math.sin(d + (t * this.speed) * this.period) * this.amplitude;
        return v;
    }
}
