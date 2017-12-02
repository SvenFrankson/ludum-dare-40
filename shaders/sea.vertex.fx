precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;

// Uniforms
uniform float time;
uniform mat4 world;
uniform mat4 worldViewProjection;

// Varying
varying vec3 vPositionW;
varying vec3 vNormalW;

void main(void) {
    float a1 = 0.14;
    float s1 = 0.623;
    float p1 = 3.12;
    vec2 dir1 = vec2(1., 0.);

    float a2 = 0.25;
    float s2 = 0.423;
    float p2 = 7.42;
    vec2 dir2 = vec2(0.7, 0.7);

    float a3 = 0.32;
    float s3 = 0.238;
    float p3 = 15.62;
    vec2 dir3 = vec2(0.2, 0.9);

    float a4 = 0.41;
    float s4 = 0.124;
    float p4 = 32.56;
    vec2 dir4 = vec2(0.7, 0.314);

    vec4 outPosition = worldViewProjection * vec4(position, 1.0);

    float d1 = dot(vec2(position.x, position.z), dir1);
    float v1 = sin(d1 + (time * s1) * p1) * a1;

    float d2 = dot(vec2(position.x, position.z), dir2);
    float v2 = sin(d2 / 1.5 + (time * s2) * p2) * a2;

    float d3 = dot(vec2(position.x, position.z), dir3);
    float v3 = sin(d3 / 2.2 + (time * s3) * p3) * a3;

    float d4 = dot(vec2(position.x, position.z), dir4);
    float v4 = sin(d4 / 2.7 + (time * s4) * p4) * a4;
    
    outPosition.y += v1 + v2 + v3 + v4;

    gl_Position = outPosition;
    
    vPositionW = vec3(world * vec4(position, 1.0));
    vPositionW.y += v1 + v2 + v3 + v4;
    vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
}