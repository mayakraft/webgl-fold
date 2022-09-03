#version 300 es

uniform mat4 u_matrix;
uniform vec2 v_position;
uniform vec3 v_color;
out vec3 blend_color;
// flat out vec3 blend_color;

void main () {
	gl_Position = matrix * vec4(v_position, 1, 1);
	blend_color = v_color;
}
