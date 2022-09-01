uniform mat4 matrix;
attribute vec2 position;
attribute vec3 v_color;
varying vec3 blend_color;

void main () {
	gl_Position = matrix * vec4(position, 0, 1);
	blend_color = v_color;
}
