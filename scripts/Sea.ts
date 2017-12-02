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
        this.mesh = BABYLON.MeshBuilder.CreateGround("Sea", {width: 256, height: 256, subdivisions: 256}, scene);
        this.mesh.material = new SeaMaterial("SeaMaterial", scene);
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
}