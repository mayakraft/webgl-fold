import ear from "rabbit-ear";
import vertexShaderV1 from "./shaders-gl1/gl1-3d-model.vert?raw";
import fragmentShaderV1 from "./shaders-gl1/gl1-3d-model.frag?raw";
import vertexShaderV2 from "./shaders-gl2/gl2-3d-model.vert?raw";
import fragmentShaderV2 from "./shaders-gl2/gl2-3d-model.frag?raw";

const makeVertexArrays = (gl, graph, program) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	const vertices_color = graph.vertices_coords.map(() => [0.11, 0.11, 0.11]);
	const vertices_coords = graph.vertices_coords
		.map(coord => [...coord].concat(Array(3 - coord.length).fill(0)));
	const facesNormals = ear.graph.makeFacesNormal(graph);
	const vertices_faces = graph.vertices_faces
		? graph.vertices_faces
		: ear.graph.makeVerticesFacesUnsorted(graph);
	// const vertices_normals = vertices_coords
	// 	.map(coord => ear.math.normalize3(coord));
	// console.log("vertices_faces", vertices_faces);
	const vertices_normals = vertices_faces
		.map(faces => faces
			.filter(f => f != null) // vertices_faces can contain null
			.map(f => facesNormals[f])
			.reduce((v, u) => [v[0] + u[0], v[1] + u[1], v[2] + u[2]], [0, 0, 0]))
		.map(sums => ear.math.normalize3(sums));
	// console.log("vertices_normals", vertices_normals);
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			length: vertices_coords[0].length,
			data: new Float32Array(vertices_coords.flat()) },
		{ location: gl.getAttribLocation(program, "v_normal"),
			buffer: gl.createBuffer(),
			length: vertices_normals[0].length,
			data: new Float32Array(vertices_normals.flat()) },
	];
};

const makeElementArrays = (gl, graph) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	return [{
		mode: gl.TRIANGLES,
		buffer: gl.createBuffer(),
		data: new Uint16Array(ear.graph.triangulateConvexFacesVertices(graph).flat()),
	}];
};

const WebGLFoldedForm = (gl, version = 1, graph = {}) => {
	const program = version == 2
		? ear.webgl.createProgram(gl, vertexShaderV2, fragmentShaderV2)
		: ear.webgl.createProgram(gl, vertexShaderV1, fragmentShaderV1);
	return [{
		program,
		vertexArrays: makeVertexArrays(gl, graph, program),
		elementArrays: makeElementArrays(gl, graph),
	}];
};

export default WebGLFoldedForm;
