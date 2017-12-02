precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform float time;
uniform mat4 world;
uniform mat4 worldViewProjection;

uniform vec2 dir0;
uniform vec2 dir1;
uniform vec2 dir2;
uniform vec2 dir3;
uniform vec2 dir4;
uniform vec2 dir5;
uniform vec2 dir6;

uniform float a0;
uniform float a1;
uniform float a2;
uniform float a3;
uniform float a4;
uniform float a5;
uniform float a6;

// Varying
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;
varying float c0;
varying float c1;
varying float h0;
varying float h1;

void main(void) {

    float s0 = 11.;
    float s1 = 9.;
    float s2 = 7.;
    float s3 = 5.;
    float s4 = 3.;
    float s5 = 2.;
    float s6 = 1.;

    float ps0 = 4.;
    float k0 = 2. * 3.14 / ps0;

    float ps1 = 6.;
    float k1 = 2. * 3.14 / ps1;

    float ps2 = 8.;
    float k2 = 2. * 3.14 / ps2;

    float ps3 = 10.;
    float k3 = 2. * 3.14 / ps3;

    float ps4 = 12.;
    float k4 = 2. * 3.14 / ps4;

    float ps5 = 14.;
    float k5 = 2. * 3.14 / ps4;

    float ps6 = 16.;
    float k6 = 2. * 3.14 / ps4;

    vec4 outPosition = worldViewProjection * vec4(position, 1.0);

    float d0 = dot(vec2(position.x, position.z), dir0);
    float v0 = sin((d0 + time * s0 / 3.) * k0) * a0;

    float d1 = dot(vec2(position.x, position.z), dir1);
    float v1 = sin((d1 + time * s1 / 3.) * k1) * a1;

    float d2 = dot(vec2(position.x, position.z), dir2);
    float v2 = sin((d2 + time * s2 / 3.) * k2) * a2;

    float d3 = dot(vec2(position.x, position.z), dir3);
    float v3 = sin((d3 + time * s3 / 3.) * k3) * a3;

    float d4 = dot(vec2(position.x, position.z), dir4);
    float v4 = sin((d4 + time * s4 / 3.) * k4) * a4;

    float d5 = dot(vec2(position.x, position.z), dir5);
    float v5 = sin((d5 + time * s5 / 5.) * k5) * a5;

    float d6 = dot(vec2(position.x, position.z), dir6);
    float v6 = sin((d6 + time * s6 / 3.) * k6) * a6;

    outPosition.y += (v0 + v1 + v2 + v3 + v4 + v5 + v6);

    gl_Position = outPosition;
    
    vPositionW = vec3(world * vec4(position, 1.0));
    c0 = (v0 + v1 + v2 + v3 + v4 + v5 + v6);
    c1 = (-v0 + v1 + -v2 + v3 + -v4 + v5 + v6);
    h0 = sin(6.28 * time / 10.) / 4.;
    h1 = cos(6.28 * time / 10.) / 4.;
    vNormalW = normalize(vec3(world * vec4(normal, 0.0)));

    vUV = uv * 16.;
}