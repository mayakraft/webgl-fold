import ear from "rabbit-ear";
import vertexShaderV1 from "../shaders-webgl1/3d-model-100.vert?raw";
import fragmentShaderV1 from "../shaders-webgl1/3d-model-100.frag?raw";
import vertexShaderV2 from "../shaders-webgl2/3d-model-300.vert?raw";
import fragmentShaderV2 from "../shaders-webgl2/3d-model-300.frag?raw";
import {
	nudgeVerticesWithFaceOrders,
	nudgeVerticesWithFacesLayer,
} from "../graph/nudgeVertices";

// const LAYER_NUDGE = 1e-4;
const LAYER_NUDGE = 1e-5;
// const LAYER_NUDGE = 12e-6;

const makeVertexArrays = (gl, program, graph, options = {}) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	const {
		vertices_coords,
		vertices_normal,
		vertices_barycentric,
	} = ear.webgl.makeFacesVertexData(graph, options);
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_coords[0].length,
			data: new Float32Array(vertices_coords.flat()) },
		{ location: gl.getAttribLocation(program, "v_normal"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_normal[0].length,
			data: new Float32Array(vertices_normal.flat()) },
		{ location: gl.getAttribLocation(program, "v_barycentric"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 3,
			data: new Float32Array(vertices_barycentric.flat()) },
		// { location: gl.getAttribLocation(program, "v_rawEdge"),
		// 	buffer: gl.createBuffer(),
		// 	type: gl.FLOAT,
		// 	// type: gl.INT,
		// 	// type: gl.UNSIGNED_BYTE,
		// 	length: 1,
		// 	data: new Float32Array(rawEdges.flat()) },
	];
};
/**
 * WebGL 2 can handle Uint32Array. WebGL 1 cannot and must use 16 bit.
 */
const makeElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	return [{
		mode: gl.TRIANGLES,
		buffer: gl.createBuffer(),
		data: version === 2
			? new Uint32Array(graph.faces_vertices.flat())
			: new Uint16Array(graph.faces_vertices.flat()),
	}];
};

const WebGLFoldedForm = (gl, version = 1, graph = {}, options = {}) => {
	// get options, if they exist
	const layerNudge = options.layerNudge === undefined
		? LAYER_NUDGE
		: options.layerNudge;

	const exploded = JSON.parse(JSON.stringify(graph));
	// we render "J" joined edges differently from all others. if edges_assignment
	// doesn't exist, make it with all assignments set to "U".
	// the user will never see this data, it's just for visualization.
	if (!exploded.edges_assignment) {
		const edgeCount = ear.graph.count.edges(graph) || ear.graph.countImplied.edges(graph);
		exploded.edges_assignment = Array(edgeCount).fill("U");
	}
	let faces_nudge = [];
	if (exploded.faceOrders) {
		faces_nudge = nudgeVerticesWithFaceOrders(exploded);
	}
	else if (exploded.faces_layer) {
		faces_nudge = nudgeVerticesWithFacesLayer(exploded);
	}
	// console.log("faces_nudge", faces_nudge);
	const change = ear.graph.triangulate(exploded);
	const change2 = ear.graph.explode(exploded);
	Object.assign(change, change2);
	// console.log("change", change);

	if (change.faces) {
		change.faces.map.forEach((oldFace, face) => {
			const nudge = faces_nudge[oldFace];
			if (!nudge) { return; }
			exploded.faces_vertices[face].forEach(v => {
				const vec = ear.math.scale(nudge.vector, nudge.layer * layerNudge);
				exploded.vertices_coords[v] = ear.math.add(
					ear.math.resize(3, exploded.vertices_coords[v]),
					vec,
				);
			});
		});
	}

	const program = version == 2
		? ear.webgl.createProgram(gl, vertexShaderV2, fragmentShaderV2)
		: ear.webgl.createProgram(gl, vertexShaderV1, fragmentShaderV1);
	return [{
		program,
		vertexArrays: makeVertexArrays(gl, program, exploded, options),
		elementArrays: makeElementArrays(gl, version, exploded, options),
		flags: [gl.DEPTH_TEST],
	}];
};

export default WebGLFoldedForm;
