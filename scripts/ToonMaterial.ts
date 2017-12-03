class ToonMaterial extends BABYLON.ShaderMaterial {

    constructor(name: string, color: BABYLON.Color3, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "toon",
                fragment: "toon",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            }
        );
        scene.registerBeforeRender(this._updateCameraPosition);
        this.setColor3("color", color);
    }

    private _updateCameraPosition = () => {
        let camera = this.getScene().activeCamera;
        if (camera && camera.position) {
            this.setVector3("cameraPosition", camera.position);
        }
    }
}