<script>
	import ear from "rabbit-ear";
	import Settings from "./Settings.svelte";
	import WebGLView from "./WebGLView.svelte";
	import DragAndDrop from "./DragAndDrop.svelte";

	// the origami (FOLD object)
	let FOLD = {};
	// file_frames, the first element [0] is the top layer frame itself.
	// even if a file_frames key does not exist, [0] will be filled.
	let frames = [];
	let selectedFrame = 0;

	// view options
	let perspective = "orthographic";
	let viewClass = "creasePattern"; // "foldedForm"; // "creasePattern";
	let strokeWidth = 0.0025;
	let opacity = 1.0;
	let fov = 45;
	let flipCameraZ = false;
	let frontColor = "#57f";
	let backColor = "#fff";
	let showFoldedCreases = false;
	let showFoldedFaceOutlines = true;
	let layerNudge = 1e-5;

	const solver3dLayers = (graph) => {
		if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return; }
		// const prepare = ear.layer.prepare(graph);
		// console.log("prepare", prepare);
		const solutions = ear.layer.solver3d(graph);
		console.log("solutions", solutions);
		const orders = solutions.map(el => el.faceOrders());
		console.log("orders", orders);
		const faceOrders = [].concat(...orders);
		console.log("faceOrders", faceOrders);
		return faceOrders;
	};

	const solver2dLayers = (graph) => {
		if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return; }
		ear.graph.populate(graph);
		const solver = ear.layer.solver(graph);
		console.log("solver", solver);
		return solver.faceOrders;
	}

	// $: solver3dLayers(frames[selectedFrame]);

	// const getFileFrames = (foldFile) => !foldFile.file_frames
	// 	? [ear.graph.flattenFrame(foldFile, 0)]
	// 	: Array.from(Array(foldFile.file_frames.length + 1))
	// 		.map((_, i) => ear.graph.flattenFrame(foldFile, i));

	const getFileFrames = (foldFile) => {
		// foldFile.faceOrders = solver3dLayers(foldFile);
		// foldFile.faceOrders = solver2dLayers(foldFile);
		return !foldFile.file_frames
			? [ear.graph.flattenFrame(foldFile, 0)]
			: Array.from(Array(foldFile.file_frames.length + 1))
				.map((_, i) => ear.graph.flattenFrame(foldFile, i));
	};

	const loadFOLD = (result) => {
		FOLD = result;
		selectedFrame = 0;
	};

	$: frames = getFileFrames(FOLD);

</script>
	
	<DragAndDrop {loadFOLD} />
<main>
	<WebGLView
		origami={frames[selectedFrame]}
		{viewClass}
		{perspective}
		{strokeWidth}
		{layerNudge}
		{opacity}
		{fov}
		{flipCameraZ}
		{frontColor}
		{backColor}
		{showFoldedCreases}
		{showFoldedFaceOutlines}
	/>
	<Settings
		frames={frames}
		bind:selectedFrame={selectedFrame}
		bind:perspective={perspective}
		bind:viewClass={viewClass}
		bind:strokeWidth={strokeWidth}
		bind:layerNudge={layerNudge}
		bind:opacity={opacity}
		bind:fov={fov}
		bind:flipCameraZ={flipCameraZ}
		bind:frontColor={frontColor}
		bind:backColor={backColor}
		bind:showFoldedCreases={showFoldedCreases}
		bind:showFoldedFaceOutlines={showFoldedFaceOutlines}
		{loadFOLD}
		origami={frames[selectedFrame]}
	/>
</main>

<style>
	main {
		height: 100%;
		overflow: hidden;
	}
</style>
