precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
varying float c0;
varying float c1;
varying float h0;
varying float h1;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;

uniform float time;

void main(void) {
    vec3 color = vec3(71. / 255., 184. / 255., 204. / 255.);
    float c = vPositionW.y;

    if (abs(c0 + h0) < 0.05) {
        color = vec3(1., 1., 1.);
    } else if (abs(c1 + h1) < 0.05) {
        color = vec3(0.5, 0.5, 0.5);
    }

    gl_FragColor = vec4(color, 1.);
}