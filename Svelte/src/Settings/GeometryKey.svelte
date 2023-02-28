<script>
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

	import {
		FOLD,
		frames,
		frame,
		frameIndex,
		modifyFrame,
	} from "../stores/File.js";

	export let key = "";

	/**
	 * @description special case where we make both
	 * faces_vertices and faces_edges
	 */
	const makeFacesVerticesAndEdges = () => {
		const faces = makePlanarFaces($frame);
		faces_vertices = faces.map(el => el.vertices);
		faces_edges = faces.map(el => el.edges);
		$frame = { ...$frame, faces_vertices, faces_edges };
	};
	/**
	 *
	 */
	const generateGeometry = () => {
		const isCP = $frame.frame_classes
			&& $frame.frame_classes.includes("creasePattern");
		const is2D = $frame.vertices_coords
			&& $frame.vertices_coords[0]
			&& $frame.vertices_coords[0].length < 3;

		let newArray;
		switch (key) {
		case "vertices_vertices":
			newArray = makeVerticesVertices($frame);
			break;
		case "vertices_edges":
			if (!$frame.vertices_vertices) {
				$frame.vertices_vertices = makeVerticesVertices($frame);
			}
			newArray = makeVerticesEdges($frame);
			break;
		case "vertices_faces":
			newArray = makeVerticesFaces($frame);
			break;
		case "edges_faces":
			newArray = makeEdgesFaces($frame);
			break;
		case "edges_assignment":
			if ($frame.edges_foldAngle) {
				newArray = makeEdgesAssignment($frame);
			}
			break;
		case "edges_foldAngle":
			if (is2D && $frame.edges_assignment) {
				newArray = makeEdgesFoldAngle($frame);
			} else {
				try {
					newArray = makeEdgesFoldAngleFromFaces($frame);
				} catch (error) {
					console.warn(error);
				}
			}
			break;
		case "faces_vertices":
			if ($frame.faces_edges) {
				newArray = makeFacesVerticesFromEdges($frame);
			} else if (isCP || is2D) {
				makeFacesVerticesAndEdges();
			}
			break;
		case "faces_edges":
			if ($frame.faces_vertices) {
				newArray = makeFacesEdgesFromVertices($frame);
			} else if (isCP || is2D) {
				makeFacesVerticesAndEdges();
			}
			break;
		case "faces_faces": 
			newArray = makeFacesFaces($frame);
		case "faceOrders":
			break;
		}
		// if a new array was successfully created, add it
		// to the FOLD object (create new object to cause update)
		if (newArray) {
			// $frame = { ...$frame, [key]: newArray };
			modifyFrame({ [key]: newArray });
		}
	};

</script>

	<p>
		{#if $frame[key]}
			<span class="light">{key}:</span>
			<span>✓</span>
		{/if}
		{#if !$frame[key]}
			<span>{key}:</span>
			<button on:click={generateGeometry}>generate</button>
		{/if}
	</p>

<style>
	p {
		margin: 0;
		padding: 0;
		font-size: 0.8rem;
		line-height: 1rem;
		word-break: break-word;
		color: #999;
	}
	.light {
		color: #ccc;
		font-weight: bold;
	}
	button {
		line-height: 0.65rem;
	}
	/*.button {
		font-weight: bold;
		color: #49f;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
		cursor: pointer;
		border: 1px solid transparent;
		transition: border-color 0.25s;
	}
	.button:hover {
		border-color: #49f;
		transition: border-color 0s;
	}*/

</style>