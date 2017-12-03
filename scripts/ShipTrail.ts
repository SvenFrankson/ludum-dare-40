class ShipTrail extends BABYLON.Mesh {

    private length: number = 300;

    private points: BABYLON.Vector3[] = [];
    private normals: BABYLON.Vector3[] = [];

    constructor(public origin: BABYLON.Vector3, public target: BABYLON.AbstractMesh, public normalLength: number, scene: BABYLON.Scene) {
        super("ShipTrail", scene);
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

    private initialize(): void {
        let positions: number[] = [];
        let indices: number[] = [];
        let data: BABYLON.VertexData = new BABYLON.VertexData();

        for (let i: number = 0; i < this.points.length; i++) {
            positions.push(this.points[i].x, this.points[i].y, this.points[i].z);
            positions.push(this.points[i].x, this.points[i].y, this.points[i].z);
        }

        for (let i: number = 0; i < this.points.length - 1; i++) {
            indices.push(2 * i, 2 * i + 1, 2 * i + 3);
            indices.push(2 * i, 2 * i + 3, 2 * i + 2);
            indices.push(2 * i, 2 * i + 3, 2 * i + 1);
            indices.push(2 * i, 2 * i + 2, 2 * i + 3);
        }

        data.positions = positions;
        data.indices = indices;
        data.applyToMesh(this, true);
    }

    private _updateTrail = () => {
        this.points.push(this.origin.clone());
        this.points.splice(0, 1);

        this.normals.push(this.target.getDirection(BABYLON.Axis.X).scaleInPlace(0.2));
        this.normals.splice(0, 1);

        let positions: number[] = [];

        for (let i: number = 0; i < this.points.length; i++) {
            this.points[i].x += this.normalLength * this.normals[i].x / 3;
            this.points[i].y += this.normalLength * this.normals[i].y / 3;
            this.points[i].z += this.normalLength * this.normals[i].z / 3;
            positions.push(this.points[i].x + this.normals[i].x * i / this.length, this.points[i].y + this.normals[i].y * i / this.length, this.points[i].z + this.normals[i].z * i / this.length);
            positions.push(this.points[i].x - this.normals[i].x * i / this.length, this.points[i].y - this.normals[i].y * i / this.length, this.points[i].z - this.normals[i].z * i / this.length);
        }

        this.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false);
        this.computeWorldMatrix(true);
        this.refreshBoundingInfo();
    }
}