precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;

void main(void) {
    vec3 color = vec3(vPositionW.y, vPositionW.y, vPositionW.y);

    gl_FragColor = vec4(color, 1.);
}