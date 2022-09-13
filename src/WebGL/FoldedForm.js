import ear from "rabbit-ear";
import vertexShaderV1 from "./shaders-gl1/gl1-3d-model.vert?raw";
import fragmentShaderV1 from "./shaders-gl1/gl1-3d-model.frag?raw";
import vertexShaderV2 from "./shaders-gl2/gl2-3d-model.vert?raw";
import fragmentShaderV2 from "./shaders-gl2/gl2-3d-model.frag?raw";

// add two 3D vectors, store result in first parameter
const add3 = (a, b) => { a[0] += b[0]; a[1] += b[1]; a[2] += b[2]; };

const makeVertexNormals = (graph) => {
	const faces_normals = ear.graph.makeFacesNormal(graph);
	const vertices_normals = graph.vertices_coords.map(() => [0, 0, 0]);
	graph.faces_vertices
		.forEach((vertices, f) => vertices
			.forEach(v => add3(vertices_normals[v], faces_normals[f])));
	return vertices_normals.map(v => ear.math.normalize3(v));
}

const makeVertexArrays = (gl, graph, program) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	const vertices_coords = graph.vertices_coords
		.map(coord => [...coord].concat(Array(3 - coord.length).fill(0)));
	const vertices_normals = makeVertexNormals(graph);
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
		data: new Uint32Array(ear.graph.triangulateConvexFacesVertices(graph).flat()),
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
		flags: [gl.DEPTH_TEST],
	}];
};

export default WebGLFoldedForm;
