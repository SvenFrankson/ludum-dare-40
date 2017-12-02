class Wave {

    constructor(
        public amplitude: number,
        public speed: number,
        public period: number,
        public direction: BABYLON.Vector2
    ) {
        
    }

    private _evaluatePos: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public evaluate(x: number, y: number, t: number): number {
        let v = 0;
        this._evaluatePos.x = x;
        this._evaluatePos.y = y;

        let d = BABYLON.Vector2.Dot(this._evaluatePos, this.direction);
        v = Math.sin(d + (t * this.speed) * this.period) * this.amplitude;

        return v;
    }
}