const edgeLength = (graph, index) => {
	const vertices = graph.edges_vertices[index]
		.map(vert => graph.vertices_coords[vert]);
	return ear.math.distance(...vertices);
};
const averageEdgeLength = (graph) => {
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

const updateViewSettings = () => {
	// infer view style if frame_classes exists
	if (origami.frame_classes) {
		if (origami.frame_classes.includes("creasePattern")) {
			perspective = "orthographic";
			viewClass = "creasePattern";
		} else if (origami.frame_classes.includes("foldedForm")) {
			perspective = "perspective";
			viewClass = "foldedForm";
		}
	}
	// find a decent stroke width
	const avgEdgeLen = averageEdgeLength(origami);
	strokeWidth = avgEdgeLen * 0.02;
	// find a decent spacing between layers (layerNudge)
	const bounds = ear.graph.getBoundingBox(origami);
	if (bounds && bounds.span) {
		const maxSpan = Math.max(...bounds.span);
		layerNudge = maxSpan * 0.0001;
	}
};

document.querySelector("input[type=file]")
	.addEventListener('input', (event) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			origami = JSON.parse(event.target.result);
			updateViewSettings();
			rebuildAllAndDraw();
		};
		reader.readAsText(event.target.files[0]);
	});
