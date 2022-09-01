uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 matrix;
attribute vec3 position;
attribute vec3 normal;
// attribute vec3 v_color;
varying vec3 blend_color;
varying vec3 normal_color;

// void main () {
// 	gl_Position = matrix * vec4(position, 1);
// 	normal_color = vec3(
// 		dot(normal, (matrix * vec4(1, 0, 0, 0)).xyz),
// 		dot(normal, (matrix * vec4(0, 1, 0, 0)).xyz),
// 		dot(normal, (matrix * vec4(0, 0, 1, 0)).xyz)
// 	);
// 	// normal_color = vec3(
// 	// 	dot(normal, vec4(1, 0, 0, 0).xyz),
// 	// 	dot(normal, vec4(0, 1, 0, 0).xyz),
// 	// 	dot(normal, vec4(0, 0, 1, 0).xyz)
// 	// );
// 	blend_color = normal_color;
// }

void main () {
	gl_Position = matrix * vec4(position, 1);
	// blend_color = v_color;
	// uniforms.modelViewMatrix
	normal_color = vec3(
		dot(normal, (modelViewMatrix * vec4(1, 0, 0, 0)).xyz),
		dot(normal, (modelViewMatrix * vec4(0, 1, 0, 0)).xyz),
		dot(normal, (modelViewMatrix * vec4(0, 0, 1, 0)).xyz)
	);
	// normal_color = vec3(
	// 	dot(normal, vec4(1, 0, 0, 0).xyz),
	// 	dot(normal, vec4(0, 1, 0, 0).xyz),
	// 	dot(normal, vec4(0, 0, 1, 0).xyz)
	// );

	float grayX = abs(normal_color.x);
	float grayY = abs(normal_color.y);
	float grayZ = abs(normal_color.z);
	float gray = 0.25 + clamp(grayY, 1.0, 0.25) * 0.5 + grayX * 0.25 + grayZ * 0.25;
	float c = clamp(gray, 0.0, 1.0);
	blend_color = vec3(c, c, c);

	//  float gray = (grayX + grayY + grayZ) / 3.0 * 1.414;
	//  float gray = grayY * 0.5 + 0.5;
	//  float gray = clamp(grayY, 0.25, 1.0) * 0.5 + 0.5 + grayX * 0.25 + grayZ * 0.25;
	//  return float4(c, c, c, 1);

	// blend_color = normalize(normal);
}
