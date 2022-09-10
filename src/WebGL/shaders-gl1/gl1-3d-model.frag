#version 100

precision mediump float;
uniform float u_opacity;
varying vec3 blend_color;

void main () {
	gl_FragColor = vec4(blend_color.rgb, u_opacity);
	// gl_FragDepth = 0.5;
}
