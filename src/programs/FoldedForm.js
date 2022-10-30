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

/**
 * get one point from each face
 */
const makeFacesPoint = (graph) => graph.faces_vertices
	.map(fv => graph.vertices_coords[fv[0]]);

// add two 3D vectors, store result in first parameter
const add3 = (a, b) => { a[0] += b[0]; a[1] += b[1]; a[2] += b[2]; };

const makeVertexNormals = (graph) => {
	const faces_normals = ear.graph.makeFacesNormal(graph);
	const vertices_normals = graph.vertices_coords.map(() => [0, 0, 0]);
	graph.faces_vertices
		.forEach((vertices, f) => vertices
			.forEach(v => add3(vertices_normals[v], faces_normals[f])));
	return vertices_normals.map(v => ear.math.normalize3(v));
};

const makeVertexArrays = (gl, program, graph, change, options = {}) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return []; }
	const vertices_coords = graph.vertices_coords
		.map(coord => [...coord].concat(Array(3 - coord.length).fill(0)));
	const vertices_normals = makeVertexNormals(graph);
	const barycentric = vertices_coords
		.map((_, i) => i % 3)
		.map(n => [n === 0 ? 1 : 0, n === 1 ? 1 : 0, n === 2 ? 1 : 0]);
	// // const rawEdges = graph.faces_rawEdge.flatMap(n => [n, n, n]);
	// const rawEdges = graph.faces_rawEdge;
	// // console.log("bary", barycentric, rawEdges);
	const facesEdgesIsJoined = graph.faces_edges
		.map(edges => edges
			.map(e => graph.edges_assignment[e])
			.map(a => a === "J" || a === "j"));

	if (!options.showTrianglulation) {
		for (let i = 0; i < facesEdgesIsJoined.length; i += 1) {
			if (facesEdgesIsJoined[i][0]) {
				barycentric[i * 3 + 0][2] = barycentric[i * 3 + 1][2] = 100;
			}
			if (facesEdgesIsJoined[i][1]) {
				barycentric[i * 3 + 1][0] = barycentric[i * 3 + 2][0] = 100;
			}
			if (facesEdgesIsJoined[i][2]) {
				barycentric[i * 3 + 0][1] = barycentric[i * 3 + 2][1] = 100;
			}
		}
	}
	// console.log("rawEdges.flat()", new Uint32Array(rawEdges.flat()));
	return [
		{ location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_coords[0].length,
			data: new Float32Array(vertices_coords.flat()) },
		{ location: gl.getAttribLocation(program, "v_normal"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_normals[0].length,
			data: new Float32Array(vertices_normals.flat()) },
		{ location: gl.getAttribLocation(program, "v_barycentric"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 3,
			data: new Float32Array(barycentric.flat()) },
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
		vertexArrays: makeVertexArrays(gl, program, exploded, change, options),
		elementArrays: makeElementArrays(gl, version, exploded, options),
		flags: [gl.DEPTH_TEST],
	}];
};

export default WebGLFoldedForm;
