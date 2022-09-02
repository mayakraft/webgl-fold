#version 300 es

uniform mat4 matrix;
uniform vec2 position;
uniform vec3 color;
out vec3 blend_color;
// flat out vec3 blend_color;

void main () {
	gl_Position = matrix * vec4(position, 1, 1);
	blend_color = color;
}
