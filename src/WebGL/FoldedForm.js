import ear from "rabbit-ear";
import vertexShader from "./shaders/gl1-simple-3d.vert?raw";
import fragmentShader from "./shaders/gl1-simple.frag?raw";

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
	const vertices_normals = vertices_faces
		.map(faces => faces
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

const foldedFacesV1 = (gl, graph) => {
	const program = ear.webgl.createProgram(gl, vertexShader, fragmentShader);
	return {
		program,
		vertexArrays: makeVertexArrays(gl, graph, program),
		elementArrays: makeElementArrays(gl, graph),
	};
};

const WebGLFoldedForm = (gl, version = 1, graph = {}) => {
	switch (version) {
		case 1: return [foldedFacesV1(gl, graph)]; break;
		case 2: return [foldedFacesV1(gl, graph)]; break;
	}
};

export default WebGLFoldedForm;
