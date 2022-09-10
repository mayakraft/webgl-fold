#version 300 es

// precision mediump float;
precision highp float;
uniform float u_opacity;
in vec3 blend_color;
out vec4 outColor;

void main () {
	outColor = vec4(blend_color.rgb, u_opacity);
	// gl_FragDepth = 0.5;
}
