<script>
	import ear from "rabbit-ear";
	import Settings from "./Settings.svelte";
	import WebGLView from "./WebGLView.svelte";

	// the origami (FOLD object)
	let FOLD = {};
	let frames = [];
	let selectedFrame = 0;

	// view options
	let perspective = "orthographic";
	let viewClass = "creasePattern"; // "foldedForm"; // "creasePattern";
	let strokeWidth = 0.0025;
	let opacity = 1.0;
	let fov = 45;
	let frontColor = "#5580ff";
	let backColor = "#fff";

	$: frames = getFileFrames(FOLD);

	const getFileFrames = (foldFile) => !foldFile.file_frames
		? [ear.graph.flattenFrame(foldFile, 0)]
		: Array.from(Array(foldFile.file_frames.length + 1))
			.map((_, i) => ear.graph.flattenFrame(foldFile, i));

	const loadFOLD = (result) => {
		FOLD = result;
		selectedFrame = 0;
	};
</script>

<main>
	<WebGLView
		origami={frames[selectedFrame]}
		{viewClass}
		{perspective}
		{strokeWidth}
		{opacity}
		{fov}
		{frontColor}
		{backColor}
	/>
	<Settings
		frames={frames}
		bind:selectedFrame={selectedFrame}
		bind:perspective={perspective}
		bind:viewClass={viewClass}
		bind:strokeWidth={strokeWidth}
		bind:opacity={opacity}
		bind:fov={fov}
		bind:frontColor={frontColor}
		bind:backColor={backColor}
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
