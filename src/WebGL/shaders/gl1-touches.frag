precision mediump float;
// varying vec2 uf_resolution;
// varying float uf_pixelRatio;
// uniform mat4 matrix;
// uniform mat4 inverseMatrix;
uniform vec3 touchPoint;
// varying mat4 mat;
// varying mat4 invMat;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform mat4 matrix;
uniform mat4 inverseMatrix;

void main () {
	// if (gl_FragCoord.x < 500.0) {
	// 	gl_FragColor = vec4(1, 0, 0, 1);
	// } else {
	// 	gl_FragColor = vec4(0, 1, 1, 1);
	// }
	// vec2 fragCoord = (mat * gl_FragCoord).xy;
	// vec2 fragCoord = gl_FragCoord.xy;// / uf_resolution;
	
	// vec2 tp = (vec2(0, 0) * 0.5 + 0.5) * uf_resolution.xy;
	// vec2 tp = (touchPoint.xy * 0.5 + 0.5);// * uf_resolution.xy;
	// vec2 tp = (invMat * vec4(touchPoint, 1)).xy;


	// vec2 scaled = vec2(-touchPoint.x, -touchPoint.y) * uf_pixelRatio;
	// vec2 projected = (invMat * vec4(scaled, 0, 1)).xy;
	// vec2 tp = projected * uf_resolution;
	// float d = distance(gl_FragCoord.xy, tp);// / uf_resolution);
	// float color = 1.0 - step(50.0, d);
	// gl_FragColor = vec4(color, 0, color, 1);


	// this works when touchPoint is set to [e.offsetX, e.offsetY, 0]
	vec2 tp = vec2(touchPoint.x, u_resolution.y - touchPoint.y) * u_pixelRatio;
	float d = distance(gl_FragCoord.xy, tp);// / uf_resolution);
	float alpha = 1.0 - step(20.0, d);
	gl_FragColor = vec4(1.0, 0.8, 0.28, alpha);
}
