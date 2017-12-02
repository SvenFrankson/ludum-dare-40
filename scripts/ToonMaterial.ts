class ToonMaterial extends BABYLON.ShaderMaterial {

    constructor(name: string, scene: BABYLON.Scene) {
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
    }

    private _updateCameraPosition = () => {
        let camera = this.getScene().activeCamera;
        if (camera && camera.position) {
            this.setVector3("cameraPosition", camera.position);
        }
    }
}