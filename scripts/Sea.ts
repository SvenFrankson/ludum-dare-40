class Sea {

    public mesh: BABYLON.Mesh;
    public size: number = 0;
    public heightMap: number[][];

    constructor(size: number) {
        this.size = size;
        this.heightMap = [];
        for (let i = 0; i < this.size; i++) {
            this.heightMap[i] = [];
        }
    }

    public instantiate(scene: BABYLON.Scene): void {
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

        this.update();
    }

    public update(): void {
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