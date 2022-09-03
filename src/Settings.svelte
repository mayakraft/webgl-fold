<script>
	import ear from "rabbit-ear";
	// example FOLD files
	import craneCP from "./fold/crane-cp.fold?raw";
	import craneCP600 from "./fold/crane-cp-600.fold?raw";
	import bird3d from "./fold/bird-3d.fold?raw";
	import moosers3d from "./fold/moosers-train-3d.fold?raw";

	export let origami = {};
	export let perspective = "orthographic";
	export let viewClass = "creasePattern";
	export let strokeWidth = 0.0025;
	export let fov = Math.PI / 4;
	export let loadFOLD = () => {};
</script>

<div class="settings">
	<input
		type="radio"
		name="radio-webgl-perspective"
		value="radio-webgl-perspective-orthographic"
		on:click={() => perspective = "orthographic"}
		checked={perspective==="orthographic"}>
	<label for="radio-webgl-perspective-orthographic">orthographic</label>
	<input
		type="radio"
		name="radio-webgl-perspective"
		value="radio-webgl-perspective-perspective"
		on:click={() => perspective = "perspective"}
		checked={perspective==="perspective"}>
	<label for="radio-webgl-perspective-perspective">perspective</label>
	<br />
	<span>field of view:</span><input type="text" placeholder="field of view" bind:value={fov}>

<!-- 	<br/>
	<input
		type="radio"
		name="radio-view-class"
		value="radio-view-class-crease-pattern"
		on:click={() => viewClass = "creasePattern"}
		checked={viewClass==="creasePattern"}>
	<label for="radio-view-class-crease-pattern">crease pattern</label>
	<input
		type="radio"
		name="radio-view-class"
		value="radio-view-class-folded-form"
		on:click={() => viewClass = "foldedForm"}
		checked={viewClass==="foldedForm"}>
	<label for="radio-view-class-folded-form">folded form</label> -->
	<hr />
	<span>stroke width</span><input type="range" min="0.001" max="0.2" step="0.001" bind:value={strokeWidth} />
	<hr />
	<p>current FOLD:</p>
	<p>V: <b>{ear.graph.count.vertices(origami)}</b>, E: <b>{ear.graph.count.edges(origami)}</b>, F: <b>{ear.graph.count.faces(origami)}</b></p>
	<hr />
	<p>example:</p>
	<button on:click={() => loadFOLD(JSON.parse(craneCP))}>cp: crane 1x1</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(craneCP600))}>cp: crane 600x600</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(bird3d))}>folded: flapping bird</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(moosers3d))}>folded: moser's train</button>
	<br />
</div>

<style>
.settings {
	background-color: #0001;
	z-index: 2;
	position: absolute;
	top: 0;
	left: 0;
	padding: 0.5rem;
}
</style>
