<script>
	import ear from "rabbit-ear";
	// example FOLD files
	import craneCP from "../../fold/crane-cp.fold?raw";
	import craneCP100 from "../../fold/crane-cp-100.fold?raw";
	import craneFolded from "../../fold/crane-folded.fold?raw";
	import bird3d from "../../fold/bird-3d.fold?raw";
	import moosers3d from "../../fold/moosers-train-3d.fold?raw";

	export let origami = {};
	export let perspective = "orthographic";
	export let viewClass = "creasePattern";
	export let strokeWidth = 0.0025;
	export let opacity = 1.0;
	export let fov = Math.PI / 4;
	export let loadFOLD = () => {};

	const fileDialogDidLoad = (string, filename, mimeType) => {
		try { loadFOLD(JSON.parse(string)); }
		catch (error) { window.alert(error); }
	};

	let files;
	$: if (files) {
		const file = files[0];
		let mimeType, filename;
		const reader = new FileReader();
		reader.onload = loadEvent => fileDialogDidLoad(loadEvent.target.result, filename, mimeType);
		if (files.length) {
			mimeType = files[0].type;
			filename = files[0].name;
			reader.readAsText(files[0]);
		}
	}
</script>

<div class="settings">
	<h3>viewport</h3>
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
	{#if perspective === "perspective"}
		<span>field of view:</span><input type="text" placeholder="field of view" bind:value={fov}>
		<br/>
	{/if}
	<hr />
	<h3>style</h3>
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
	<label for="radio-view-class-folded-form">folded form</label>
	<br />
	{#if viewClass === "creasePattern"}
		<span>stroke width</span><input type="range" min="0.001" max="0.2" step="0.001" bind:value={strokeWidth} />
	{/if}
	{#if viewClass === "foldedForm"}
		<span>opacity</span><input type="range" min="0" max="1" step="0.01" bind:value={opacity} />
	{/if}
	<hr />
	<h3>current FOLD</h3>
	<p>V: <b>{ear.graph.count.vertices(origami)}</b>, E: <b>{ear.graph.count.edges(origami)}</b>, F: <b>{ear.graph.count.faces(origami)}</b></p>
	<hr />
	<h3>example:</h3>
	<button on:click={() => loadFOLD(JSON.parse(craneCP))}>cp: crane 1x1</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(craneCP100))}>cp: crane 100x100</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(craneFolded))}>folded: 2D crane</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(bird3d))}>folded: 3D bird</button>
	<br />
	<button on:click={() => loadFOLD(JSON.parse(moosers3d))}>folded: 3D moser's train</button>
<!-- 	<hr />
	<p class="small">
		<b>dev notes:</b> depth test is OFF; this is intentional, the layer order will be calculated. large CPs (100x100) need larger stroke width.
	</p> -->
	<hr />
	<h3>load FOLD</h3>
	<input type="file" bind:files>
</div>

<style>
.settings {
	background-color: #0002;
	z-index: 2;
	position: absolute;
	top: 0;
	left: 0;
	padding: 0.5rem;
}
h3 {
	margin: 0;
	padding: 0;

}
input[type=text] {
	width: 3rem;
}
.small { font-size: 0.8rem; }
</style>
