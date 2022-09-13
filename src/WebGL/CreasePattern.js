import ear from "rabbit-ear";
import vertexSimpleV1 from "./shaders-gl1/gl1-simple-2d.vert?raw";
import vertexThickEdgesV1 from "./shaders-gl1/gl1-thick-edges.vert?raw";
import fragmentSimpleV1 from "./shaders-gl1/gl1-simple-2d.frag?raw";
import vertexSimpleV2 from "./shaders-gl2/gl2-simple-2d.vert?raw";
import vertexThickEdgesV2 from "./shaders-gl2/gl2-thick-edges.vert?raw";
import fragmentSimpleV2 from "./shaders-gl2/gl2-simple-2d.frag?raw";

const assignment_colors = {
	B: [0.33, 0.33, 0.33],  b: [0.33, 0.33, 0.33],
	V: [0.21, 0.39, 0.59],  v: [0.21, 0.39, 0.59],
	M: [0.73, 0.25, 0.14],  m: [0.73, 0.25, 0.14],
	F: [0.2, 0.2, 0.2],     f: [0.2, 0.2, 0.2],
	U: [0.2, 0.2, 0.2],     u: [0.2, 0.2, 0.2],
};

const make2D = (coords) => coords
	.map(coord => [0, 1]
		.map(i => coord[i] || 0));

const makeEdgesVertexArrays = (gl, graph, program) => {
	if (!graph || !graph.vertices_coords || !graph.edges_vertices) { return []; }
	const vertices_coords = make2D(graph.edges_vertices
		.flatMap(edge => edge
			.map(v => graph.vertices_coords[v]))
		.flatMap(coord => [coord, coord]));
	const edgesVector = make2D(ear.graph.makeEdgesVector(graph));
	const edgesOrigin = make2D(graph.edges_vertices.map(edge => graph.vertices_coords[edge[0]]));
	const vertices_color = graph.edges_assignment
		.flatMap(a => [assignment_colors[a], assignment_colors[a], assignment_colors[a], assignment_colors[a]]);
	const verticesEdgesVector = edgesVector
		.flatMap(el => [el, el, el, el]);
	const verticesVector = graph.edges_vertices
		.flatMap(() => [[1,0], [-1,0], [-1,0], [1,0]]);
	// console.log("vertices_coords", vertices_coords);
	// console.log("edgesVector", edgesVector);
	// console.log("edgesOrigin", edgesOrigin);
	// console.log("verticesEdgesVector", verticesEdgesVector);
	// console.log("verticesVector", verticesVector);
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			length: 2,
			// length: vertices_coords[0].length,
			data: new Float32Array(vertices_coords.flat()) },
		{ location: gl.getAttribLocation(program, "v_color"),
			buffer: gl.createBuffer(),
			length: vertices_color[0].length,
			data: new Float32Array(vertices_color.flat()) },
		{ location: gl.getAttribLocation(program, "edge_vector"),
			buffer: gl.createBuffer(),
			length: verticesEdgesVector[0].length,
			data: new Float32Array(verticesEdgesVector.flat()) },
		{ location: gl.getAttribLocation(program, "vertex_vector"),
			buffer: gl.createBuffer(),
			length: verticesVector[0].length,
			data: new Float32Array(verticesVector.flat()) },
	];
};

const makeEdgesElementArrays = (gl, graph) => {
	if (!graph || !graph.edges_vertices) { return []; }
	const edgesTriangles = graph.edges_vertices
		.map((_, i) => i * 4)
		.flatMap(i => [i + 0, i + 1, i + 2, i + 2, i + 3, i + 0]);
	return [{
		mode: gl.TRIANGLES,
		buffer: gl.createBuffer(),
		data: new Uint32Array(edgesTriangles),
	}];
};

const makeFacesVertexArrays = (gl, graph, program) => {
	if (!graph || !graph.vertices_coords) { return []; }
	const vertices_color = graph.vertices_coords.map(() => [0.11, 0.11, 0.11]);
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			length: 2,
			// length: graph.vertices_coords[0].length,
			data: new Float32Array(make2D(graph.vertices_coords).flat()) },
		{ location: gl.getAttribLocation(program, "v_color"),
			buffer: gl.createBuffer(),
			length: vertices_color[0].length,
			data: new Float32Array(vertices_color.flat()) },
	];
};

const makeFacesElementArrays = (gl, graph) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	return [{
		mode: gl.TRIANGLES,
		buffer: gl.createBuffer(),
		data: new Uint32Array(ear.graph.triangulateConvexFacesVertices(graph).flat()),
	}];
};

const cpFacesV1 = (gl, graph) => {
	const program = ear.webgl.createProgram(gl, vertexSimpleV1, fragmentSimpleV1);
	return {
		program,
		vertexArrays: makeFacesVertexArrays(gl, graph, program),
		elementArrays: makeFacesElementArrays(gl, graph),
		flags: [],
	};
};

const cpEdgesV1 = (gl, graph) => {
	const program = ear.webgl.createProgram(gl, vertexThickEdgesV1, fragmentSimpleV1);
	return {
		program,
		vertexArrays: makeEdgesVertexArrays(gl, graph, program),
		elementArrays: makeEdgesElementArrays(gl, graph),
		flags: [],
	};
};

const cpFacesV2 = (gl, graph) => {
	const program = ear.webgl.createProgram(gl, vertexSimpleV2, fragmentSimpleV2);
	return {
		program,
		vertexArrays: makeFacesVertexArrays(gl, graph, program),
		elementArrays: makeFacesElementArrays(gl, graph),
		flags: [],
	};
};

const cpEdgesV2 = (gl, graph) => {
	const program = ear.webgl.createProgram(gl, vertexThickEdgesV2, fragmentSimpleV2);
	return {
		program,
		vertexArrays: makeEdgesVertexArrays(gl, graph, program),
		elementArrays: makeEdgesElementArrays(gl, graph),
		flags: [],
	};
};

const WebGLCreasePattern = (gl, version = 1, graph = {}) => {
	switch (version) {
		case 1: return [cpFacesV1(gl, graph), cpEdgesV1(gl, graph)]; break;
		case 2: return [cpFacesV2(gl, graph), cpEdgesV2(gl, graph)]; break;
	}
};

export default WebGLCreasePattern;
