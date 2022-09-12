#version 300 es
// precision mediump float;
precision highp float;

uniform float u_opacity;

// in highp vec4 gl_FragCoord;
// in mediump vec2 gl_PointCoord; // 0.0 to 1.0, location on the screen
// in bool gl_FrontFacing;
// out highp float gl_FragDepth;

in vec3 front_color;
in vec3 back_color;
out vec4 outColor;

void main () {
	gl_FragDepth = gl_FragCoord.z;
	vec3 color = gl_FrontFacing ? front_color : back_color;
	outColor = vec4(color, u_opacity);
}
