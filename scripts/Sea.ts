class Sea {

    public mesh: BABYLON.Mesh;
    public size: number = 0;
    public heightMap: number[][];
    public waves: Wave[];
    public time: number = 0;

    constructor(size: number) {
        this.size = size;
        this.heightMap = [];
        for (let i = 0; i <= this.size; i++) {
            this.heightMap[i] = [];
        }
        this.waves = [];
        for (let i: number = 0; i < 6; i++) {
            this.waves.push(
                new Wave(
                    Math.random() / 4,
                    Math.random() / 1,
                    5 * Math.random(),
                    new BABYLON.Vector2(Math.random(), Math.random()).normalize()
                )
            )
        }
    }

    public instantiate(scene: BABYLON.Scene): void {
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
                indices.push(
                    i + (j + 1) * s1,
                    i + j * s1,
                    (i + 1) + j * s1
                );
                indices.push(
                    (i + 1) + (j + 1) * s1,
                    i + (j + 1) * s1,
                    (i + 1) + j * s1
                );
            }
        }

        let data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.applyToMesh(this.mesh, true);

        scene.registerBeforeRender(this._update);
    }

    private wavesSum(x: number, y: number, t: number): number {
        let s = 0;
        for (let i: number = 0; i < this.waves.length; i++) {
            s += this.waves[i].evaluate(x, y, t);
        }
        return s;
    }

    public evaluate(x: number, y: number): number {
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

    private _update = () => {
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
                indices.push(
                    i + j * s1,
                    i + (j + 1) * s1,
                    (i + 1) + j * s1
                );
                indices.push(
                    i + (j + 1) * s1,
                    (i + 1) + (j + 1) * s1,
                    (i + 1) + j * s1
                );
            }
        }

        this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true, false);
    }
}