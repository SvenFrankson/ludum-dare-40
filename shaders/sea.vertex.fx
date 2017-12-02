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
    float amplitude = 1.;
    float speed = 1.;
    float period = 2.;
    vec2 direction = vec2(1., 0.);

    vec4 outPosition = worldViewProjection * vec4(position, 1.0);

    float d = dot(vec2(position.x, position.z), direction);
    float v = sin(d + (time * speed) * period) * amplitude;
    outPosition.y += v;

    gl_Position = outPosition;
    
    vPositionW = vec3(world * vec4(position, 1.0));
    vPositionW.y += v;
    vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
}