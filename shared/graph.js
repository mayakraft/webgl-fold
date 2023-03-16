import {
	makePlanarFaces,
	makeVerticesVertices,
	makeVerticesEdges,
	makeVerticesFaces,
	makeEdgesFaces,
	makeEdgesAssignment,
	makeEdgesFoldAngle,
	makeEdgesFoldAngleFromFaces,
	makeFacesVerticesFromEdges,
	makeFacesEdgesFromVertices,
	makeFacesFaces,
} from "rabbit-ear/graph/make.js";
// import ear from "rabbit-ear";
import { distance } from "rabbit-ear/math/algebra/vector.js";

const edgeLength = (graph, index) => {
	const vertices = graph.edges_vertices[index]
		.map(vert => graph.vertices_coords[vert]);
	// return ear.math.distance(...vertices);
	return distance(...vertices);
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
/**
 *
 */
export const makeComponent = (graph, key) => {
	const isCP = graph.frame_classes
		&& graph.frame_classes.includes("creasePattern");
	const is2D = graph.vertices_coords
		&& graph.vertices_coords[0]
		&& graph.vertices_coords[0].length < 3;

	let newArray;
	switch (key) {
	case "vertices_vertices":
		newArray = makeVerticesVertices(graph);
		break;
	case "vertices_edges":
		if (!graph.vertices_vertices) {
			graph.vertices_vertices = makeVerticesVertices(graph);
		}
		newArray = makeVerticesEdges(graph);
		break;
	case "vertices_faces":
		newArray = makeVerticesFaces(graph);
		break;
	case "edges_faces":
		newArray = makeEdgesFaces(graph);
		break;
	case "edges_assignment":
		if (graph.edges_foldAngle) {
			newArray = makeEdgesAssignment(graph);
		}
		break;
	case "edges_foldAngle":
		if (is2D && graph.edges_assignment) {
			newArray = makeEdgesFoldAngle(graph);
		} else {
			try {
				newArray = makeEdgesFoldAngleFromFaces(graph);
			} catch (error) {
				console.warn(error);
			}
		}
		break;
	case "faces_vertices":
		if (graph.faces_edges) {
			newArray = makeFacesVerticesFromEdges(graph);
		} else if (isCP || is2D) {
			const { faces_vertices, faces_edges } = makePlanarFaces(graph);
			return { faces_vertices, faces_edges };
		}
		break;
	case "faces_edges":
		if (graph.faces_vertices) {
			newArray = makeFacesEdgesFromVertices(graph);
		} else if (isCP || is2D) {
			const { faces_vertices, faces_edges } = makePlanarFaces(graph);
			return { faces_vertices, faces_edges };
		}
		break;
	case "faces_faces": 
		newArray = makeFacesFaces(graph);
	case "faceOrders":
		break;
	}
	// if a new array was successfully created, add it
	// to the FOLD object (create new object to cause update)
	return newArray
		? { [key]: newArray }
		: undefined;
};
