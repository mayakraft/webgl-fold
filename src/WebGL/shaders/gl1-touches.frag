precision mediump float;

// uniform vec2 u_touch;
uniform vec3 u_projectedTouch;
uniform vec2 u_resolution;
uniform mat4 u_projection;
uniform mat4 u_view;

// visualize the 2D touch in screen coordinates
// void main () {
// 	vec2 tp = vec2(u_touch.x, u_resolution.y - u_touch.y);
// 	float d = distance(gl_FragCoord.xy, tp);// / uf_resolution);
// 	float alpha = 1.0 - step(20.0, d);
// 	gl_FragColor = vec4(1.0, 0.8, 0.28, alpha);
// }

// visualize the 3D touch in world coordinates
// by converting back into screen coordinates.
// M = (0.5 scale) * (1,1,0 translate) * (-1 scale)
mat4 M = mat4(-0.5,0,0,0,0,-0.5,0,0,0,0,-0.5,0,0.5,0.5,0,1);

void main () {
	vec2 touchPoint = ((u_projection * u_view) * vec4(u_projectedTouch, 1)).xy;
	vec2 touchPointNormalized = (M * vec4(touchPoint,0,1)).xy;
	// vec2 touchPointNormalized = (-1.0 * touchPoint + 1.0) / 2.0;
	vec2 tp = touchPointNormalized * u_resolution;
	float d = distance(gl_FragCoord.xy, tp);
	float alpha = 1.0 - step(10.0, d);
	gl_FragColor = vec4(1.0, 0.8, 0.28, alpha);
}
