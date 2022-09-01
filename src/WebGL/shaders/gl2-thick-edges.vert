#version 300 es

uniform mat4 matrix;
uniform sampler2D u_texture;
uniform vec2 position;
// uniform vec3 v_color;
uniform vec2 v_vector;
// out vec3 blend_color;

void main () {
	// vec4 sample_00 = texture2D(u_texture, vec2(0, 0)); 
	// // This sample generally appears to be correct. 
	// // Changing the provided data for the B channel of texel
	// //   index 0 seems to add blue as expected
 
	// vec4 sample_01 = texture2D(u_texture, vec2(0, 1));
	// vec4 sample_02 = texture2D(u_texture, vec2(0, 2));
	// // These samples are how I expected this to work since 
	// //   the width of the texture is set to 1
	// // For some reason 01 and 02 both show the same color
 
	// vec4 sample_10 = texture2D(u_texture, vec2(1, 0));
	// vec4 sample_20 = texture2D(u_texture, vec2(2, 0));
	// // These samples are just there for testing - I don't think
	// //   that they should work
 
	// // choose which sample to display
	// vec4 sample = sample_00;
	// gl_FragColor = vec4(sample.x, sample.y, sample.z, 1);

	// vec2 nudge = vec2(
	// 	gl_VertexID % 4 * (((gl_VertexID / 2.0) % 2) * 2 - 1),
	// 	(gl_VertexID + 1) % 4 * ((((gl_VertexID + 1) / 2.0) % 2) * 2 - 1),
	// );

	// vec2 nudge = vec2(float(gl_VertexID) * 0.01, -float(gl_VertexID) * 0.01);

	gl_Position = matrix * vec4(v_vector + position, 1, 1);
	// gl_Position = matrix * vec4(nudge + position, 1, 1);
	// blend_color = v_color;
}
