precision mediump float;

uniform vec2 u_touch;
uniform vec2 u_resolution;
// uniform float u_pixelRatio;
uniform mat4 u_matrix;
uniform mat4 u_inverseMatrix;

// this works when u_touch is set to [e.offsetX, e.offsetY]
void main () {
	vec2 tp = vec2(u_touch.x, u_resolution.y - u_touch.y);
	float d = distance(gl_FragCoord.xy, tp);// / uf_resolution);
	float alpha = 1.0 - step(20.0, d);
	gl_FragColor = vec4(1.0, 0.8, 0.28, alpha);
}

// void main () {
// 	// if (gl_FragCoord.x < 500.0) {
// 	// 	gl_FragColor = vec4(1, 0, 0, 1);
// 	// } else {
// 	// 	gl_FragColor = vec4(0, 1, 1, 1);
// 	// }
// 	// vec2 fragCoord = (mat * gl_FragCoord).xy;
// 	// vec2 fragCoord = gl_FragCoord.xy;// / uf_resolution;
	
// 	// vec2 tp = (vec2(0, 0) * 0.5 + 0.5) * uf_resolution.xy;
// 	// vec2 tp = (u_touch.xy * 0.5 + 0.5);// * uf_resolution.xy;
// 	// vec2 tp = (invMat * vec4(u_touch, 1)).xy;

// 	// vec2 scaled = vec2(-u_touch.x, -u_touch.y) * uf_pixelRatio;
// 	// vec2 projected = (invMat * vec4(scaled, 0, 1)).xy;
// 	// vec2 tp = projected * uf_resolution;
// 	// float d = distance(gl_FragCoord.xy, tp);// / uf_resolution);
// 	// float color = 1.0 - step(50.0, d);
// 	// gl_FragColor = vec4(color, 0, color, 1);
// }
