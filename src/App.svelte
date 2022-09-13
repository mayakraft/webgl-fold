<script>
	import { onMount } from "svelte";
	import Settings from "./Settings.svelte";
	import WebGL from "./WebGL/WebGL.svelte";

	import craneCP from "./fold/crane-cp.fold?raw";

	// the origami
	let origami = {};
	// view options
	let perspective = "orthographic";
	let viewClass = "creasePattern"; //"foldedForm"; //"creasePattern";
	let strokeWidth = 0.0025;
	let opacity = 1.0;
	let fov = 45;

	const loadFOLD = (result) => {
		origami = result;
		// update view style according to file type
		if (origami.frame_classes) {
			if (origami.frame_classes.includes("creasePattern")) {
				perspective = "orthographic";
				viewClass = "creasePattern";
			} else if (origami.frame_classes.includes("foldedForm")) {
				perspective = "perspective";
				viewClass = "foldedForm";
			}
		}
	};

	// load example on start
	onMount(() => loadFOLD(JSON.parse(craneCP)));

</script>

<main>
	<WebGL {origami} {viewClass} {perspective} {strokeWidth} {opacity} {fov} />
	<Settings
		bind:perspective={perspective}
		bind:viewClass={viewClass}
		bind:strokeWidth={strokeWidth}
		bind:opacity={opacity}
		bind:fov={fov}
		{loadFOLD}
		{origami}
		/>
</main>

<style>
	main {
		height: 100%;
		overflow: hidden;
	}
</style>
