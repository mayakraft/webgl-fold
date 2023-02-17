<script>
	import ear from "rabbit-ear";
	export let FOLD = {};
	export let key = "";

	const makePlanarFaces = () => {
		// makePlanarFaces
	};

	const generateGeometry = () => {
		let newArray;
		switch (key) {
		case "vertices_vertices":
			newArray = ear.graph.makeVerticesVertices(FOLD);
			break;
		case "vertices_edges":
			newArray = ear.graph.makeVerticesEdges(FOLD);
			break;
		case "vertices_faces":
			newArray = ear.graph.makeVerticesFaces(FOLD);
			break;
		case "edges_faces":
			newArray = ear.graph.makeEdgesFaces(FOLD);
			break;
		case "edges_assignment":
			if (FOLD.edges_foldAngle) {
				newArray = ear.graph.makeEdgesAssignment(FOLD);
			}
			break;
		case "edges_foldAngle":
			// makeEdgesFoldAngle
			// makeEdgesFoldAngleFromFaces
			break;
		case "faces_vertices":
			break;
		case "faces_edges":
			if (FOLD.faces_vertices) {
				newArray = ear.graph.makeFacesEdgesFromVertices(FOLD);
			} else {
				makePlanarFaces();
			}
			break;
		case "faces_faces": 
			newArray = ear.graph.makeFacesFaces(FOLD);
		case "faceOrders":
			break;
		}
		// if a new array was successfully created, add it
		// to the FOLD object (create new object to cause update)
		if (newArray) {
			FOLD = { ...FOLD, [key]: newArray };
		}
	};

</script>

	<p>
		{#if FOLD[key]}
			<span class="light">{key}:</span>
			<span>✓</span>
		{/if}
		{#if !FOLD[key]}
			<span>{key}:</span>
			<span class="button" on:click={generateGeometry}>generate</span>
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
	.button {
		font-weight: bold;
		color: #fb4;
		border-radius: 0.25rem;
		padding: 0 0.25rem;
		cursor: pointer;
	}
	.button:hover {
		background-color: #541;
	}

</style>