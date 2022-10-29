import ear from "rabbit-ear";

const edgeLength = (graph, index) => {
	const vertices = graph.edges_vertices[index]
		.map(vert => graph.vertices_coords[vert]);
	return ear.math.distance(...vertices);
};
/**
 * @returns the average of (no more than) 100 edge lengths,
 * or "undefined" if the operation is not possible
 */
export const averageEdgeLength = (graph) => {
	if (!graph || !graph.edges_vertices || !graph.vertices_coords) {
		return undefined;
	}
	const step = graph.edges_vertices.length < 100
		? 1
		: Math.floor(graph.edges_vertices.length / 100);
	const count = graph.edges_vertices.length < 100
		? graph.edges_vertices.length
		: 100;
	let sum = 0;
	for (let i = 0; i < graph.edges_vertices.length; i += step) {
		sum += edgeLength(graph, i);
	}
	return sum / count;
};
