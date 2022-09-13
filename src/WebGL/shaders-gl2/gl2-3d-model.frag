#version 300 es
// precision mediump float;
precision highp float;

uniform float u_opacity;

uniform vec2 u_touch;
uniform vec2 u_resolution;

// in highp vec4 gl_FragCoord;
// in mediump vec2 gl_PointCoord; // 0.0 to 1.0, location on the screen
// in bool gl_FrontFacing;
// out highp float gl_FragDepth;

flat in int provokedVertex;

in vec3 front_color;
in vec3 back_color;
out vec4 outColor;

void main () {
	gl_FragDepth = gl_FragCoord.z;
	vec3 color = gl_FrontFacing ? front_color : back_color;
	outColor = vec4(color, u_opacity);

	// if (provokedVertex == 8) {
	// 	outColor = vec4(1, 1, 0, 1);
	// }

	// vec2 fragScale = vec2(gl_FragCoord.x / u_resolution.x, gl_FragCoord.y / u_resolution.y);
	// vec2 touchScale = vec2(u_touch.x / u_resolution.x, u_touch.y / u_resolution.y);
	// // fix. invert.
	// touchScale.y = 1.0 - touchScale.y;
	// float dist = distance(touchScale, fragScale);
	// if (dist < 0.1) {
	// 	float t = dist / 0.1;
	// 	outColor.r = outColor.r * t + 1.0 * (1.0 - t);
	// }
}
