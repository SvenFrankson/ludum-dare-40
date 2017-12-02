class SeaMaterial extends BABYLON.ShaderMaterial {
    
    public t = 0;

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "sea",
                fragment: "sea",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            }
        );
        scene.registerBeforeRender(this._updateTime);
    }

    private _updateTime = () => {
        this.setFloat("time", this.t++/60);
    }
}