uniform mat4 matrix;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float thickness;

attribute vec2 position;
attribute vec3 v_color;
attribute vec2 edge_vector;
attribute vec2 vertex_vector;

varying vec3 blend_color;

void main () {
	// dot(normal, (modelViewMatrix * vec4(1, 0, 0, 0)).xyz),
	// this one works
	float sign = vertex_vector[0];
	vec2 side = normalize(vec2(edge_vector.y * sign, -edge_vector.x * sign)) * thickness;
	gl_Position = matrix * vec4(side + position, 0, 1);

	// vec3 forward = (modelViewMatrix * vec4(0, 0, 1, 0)).xyz;
	// float sign = vertex_vector[0];
	// vec2 side = normalize(vec2(edge_vector.y * sign, -edge_vector.x * sign));
	// vec3 side3d = (modelViewMatrix * vec4(side, 0, 1)).xyz;
	// vec3 c = normalize(cross(side3d, forward)) * thickness;
	// // gl_Position = matrix * vec4(position.x + c.x, position.y + c.y, c.z, 1);
	// gl_Position = matrix * vec4(position, 0, 1) + projectionMatrix * vec4(c, 1);
	
	// vec3 forward = (modelViewMatrix * vec4(0, 0, 1, 0)).xyz;
	// vec3 edgeVec3d = (modelViewMatrix * vec4(edge_vector, 0, 0)).xyz;
	// vec3 thick = normalize(cross(edgeVec3d, forward)) * sign * thickness;
	// vec2 side = normalize(vec2(edge_vector.y * sign, -edge_vector.x * sign)) * thickness;
	// vec4 projected_vector = matrix * vec4(normalize(vec2(edge_vector.y * sign, -edge_vector.x * sign)), 0, 1);
	// gl_Position = matrix * vec4(position, 0, 1) + vec4(thick.xyz, 0);
	// gl_Position = matrix * vec4(position, 0, 1) + vec4(0, thickness * sign, 0, 0);
	blend_color = v_color;
}
