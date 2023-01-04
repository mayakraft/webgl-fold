import ear from "rabbit-ear";
import vertexSimpleV1 from "../shaders-webgl1/simple-2d-100.vert?raw";
import vertexThickEdgesV1 from "../shaders-webgl1/thick-edges-100.vert?raw";
import fragmentSimpleV1 from "../shaders-webgl1/simple-2d-100.frag?raw";
import vertexSimpleV2 from "../shaders-webgl2/simple-2d-300.vert?raw";
import vertexThickEdgesV2 from "../shaders-webgl2/thick-edges-300.vert?raw";
import fragmentSimpleV2 from "../shaders-webgl2/simple-2d-300.frag?raw";

const makeEdgesVertexArrays = (gl, program, graph) => {
	if (!graph || !graph.vertices_coords || !graph.edges_vertices) { return []; }
	const {
		vertices_coords,
		vertices_color,
		verticesEdgesVector,
		vertices_vector,
	} = ear.webgl.makeCPEdgesVertexData(graph);
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 2,
			data: new Float32Array(vertices_coords.flat()) },
		{ location: gl.getAttribLocation(program, "v_color"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_color[0].length,
			data: new Float32Array(vertices_color.flat()) },
		{ location: gl.getAttribLocation(program, "edge_vector"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: verticesEdgesVector[0].length,
			data: new Float32Array(verticesEdgesVector.flat()) },
		{ location: gl.getAttribLocation(program, "vertex_vector"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_vector[0].length,
			data: new Float32Array(vertices_vector.flat()) },
	];
};

const makeEdgesElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.edges_vertices) { return []; }
	const edgesTriangles = graph.edges_vertices
		.map((_, i) => i * 4)
		.flatMap(i => [i + 0, i + 1, i + 2, i + 2, i + 3, i + 0]);
	return [{
		mode: gl.TRIANGLES,
		buffer: gl.createBuffer(),
		data: version === 2
			? new Uint32Array(edgesTriangles)
			: new Uint16Array(edgesTriangles),
	}];
};

const make2D = (coords) => coords
	.map(coord => [0, 1]
		.map(i => coord[i] || 0));

const makeFacesVertexArrays = (gl, program, graph) => {
	if (!graph || !graph.vertices_coords) { return []; }
	const vertices_color = graph.vertices_coords.map(() => [0.11, 0.11, 0.11]);
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 2,
			data: new Float32Array(make2D(graph.vertices_coords).flat()) },
		{ location: gl.getAttribLocation(program, "v_color"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_color[0].length,
			data: new Float32Array(vertices_color.flat()) },
	];
};

const makeFacesElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	return [{
		mode: gl.TRIANGLES,
		buffer: gl.createBuffer(),
		data: version === 2
			? new Uint32Array(ear.graph.triangulateConvexFacesVertices(graph).flat())
			: new Uint16Array(ear.graph.triangulateConvexFacesVertices(graph).flat()),
	}];
};

const cpFacesV1 = (gl, version = 1, graph = {}) => {
	const program = ear.webgl.createProgram(gl, vertexSimpleV1, fragmentSimpleV1);
	return {
		program,
		vertexArrays: makeFacesVertexArrays(gl, program, graph),
		elementArrays: makeFacesElementArrays(gl, version, graph),
		flags: [],
	};
};

const cpEdgesV1 = (gl, version = 1, graph = {}) => {
	const program = ear.webgl.createProgram(gl, vertexThickEdgesV1, fragmentSimpleV1);
	return {
		program,
		vertexArrays: makeEdgesVertexArrays(gl, program, graph),
		elementArrays: makeEdgesElementArrays(gl, version, graph),
		flags: [],
	};
};

const cpFacesV2 = (gl, version = 1, graph = {}) => {
	const program = ear.webgl.createProgram(gl, vertexSimpleV2, fragmentSimpleV2);
	return {
		program,
		vertexArrays: makeFacesVertexArrays(gl, program, graph),
		elementArrays: makeFacesElementArrays(gl, version, graph),
		flags: [],
	};
};

const cpEdgesV2 = (gl, version = 1, graph = {}) => {
	const program = ear.webgl.createProgram(gl, vertexThickEdgesV2, fragmentSimpleV2);
	return {
		program,
		vertexArrays: makeEdgesVertexArrays(gl, program, graph),
		elementArrays: makeEdgesElementArrays(gl, version, graph),
		flags: [],
	};
};

const WebGLCreasePattern = (gl, version = 1, graph = {}) => {
	switch (version) {
		case 1: return [cpFacesV1(gl, version, graph), cpEdgesV1(gl, version, graph)]; break;
		case 2: return [cpFacesV2(gl, version, graph), cpEdgesV2(gl, version, graph)]; break;
	}
};

export default WebGLCreasePattern;
