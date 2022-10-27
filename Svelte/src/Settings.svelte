<script>
	import ear from "rabbit-ear";
	import { onMount } from "svelte";

	// example FOLD files
	import craneCP from "../../fold/crane-cp.fold?raw";
	import craneCP100 from "../../fold/crane-cp-100.fold?raw";
	import craneFolded from "../../fold/crane-folded.fold?raw";
	import bird3d from "../../fold/bird-3d.fold?raw";
	import moosers3d from "../../fold/moosers-train-3d.fold?raw";
	import blintzFrames from "../../fold/blintz-frames.fold?raw";
	// import huffman from "../../fold/huffman.fold?raw";
	// import mazeFolding from "../../fold/maze-folding.fold?raw";
	import polygami from "../../fold/polygami.fold?raw";
	import squareTwist from "../../fold/square-twist-frames.fold?raw";
	import threeFold from "../../fold/three-fold.fold?raw";
	import kraftBird from "../../fold/kraft-bird-base-06-mvf.fold?raw";
	import waterbomb3D from "../../fold/simple-waterbomb-3d.fold?raw";

	export let origami = {};
	export let frames = [];
	export let selectedFrame = 0;

	export let perspective = "orthographic";
	export let viewClass = "creasePattern";
	export let strokeWidth = 0.0025;
	export let opacity = 1.0;
	export let fov = Math.PI / 4;
	export let frontColor = "#5580ff";
	export let backColor = "#fff";
	export let loadFOLD = () => {};

	let files;
	let selectedExample;

	const exampleData = {
		craneCP, craneCP100, craneFolded, bird3d, moosers3d, blintzFrames,
		polygami, squareTwist, threeFold, kraftBird, waterbomb3D,
		// huffman, mazeFolding, 
	};
	const examples = [
		{ text: "cp: crane 1x", data: "craneCP" },
		{ text: "cp: crane 100x (change stroke width)", data: "craneCP100" },
		{ text: "cp: bird", data: "kraftBird" },

		{ text: "folded: 2D, simple", data: "threeFold" },
		{ text: "folded: 2D crane", data: "craneFolded" },

		{ text: "folded: 3D waterbomb (rotate it)", data: "waterbomb3D" },
		{ text: "folded: 3D flapping bird", data: "bird3d" },
		{ text: "folded: 3D moser's train", data: "moosers3d" },
		// { text: "folded: 3D huffman", data: "huffman" },
		// { text: "folded: 3D maze folding", data: "mazeFolding" },
		{ text: "folded: 3D polygami", data: "polygami" },

		{ text: "frames: blintz base", data: "blintzFrames" },
		{ text: "frames: square twist", data: "squareTwist" },
	];

	const fileDialogDidLoad = (string, filename, mimeType) => {
		try {
			loadFOLD(JSON.parse(string));
			selectedExample = null;
		}
		catch (error) { window.alert(error); }
	};

	// load example on start
	onMount(() => selectedExample = "craneCP");

	// set the view settings (crease pattern / folded, etc...)
	// depending on if the FOLD object contains frame_classes.
	const updateViewSettings = () => {
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

	$: updateViewSettings(origami);

	$: selectedExample == null
		? (() => {})()
		: loadFOLD(JSON.parse(exampleData[selectedExample]));

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
	<h3>load FOLD</h3>
	<input type="file" bind:files>

	<hr />

	<h3>example:</h3>
	<select value={selectedExample} on:change="{(e) => selectedExample = e.target.value}">
		{#each examples as example}
			<option value={example.data}>
				{example.text}
			</option>
		{/each}
	</select>

	<!-- <button on:click={() => selectedExample = null}>reset</button> -->

	<hr />

	<h3>file info</h3>

	<p>V: <b>{ear.graph.count.vertices(origami)}</b>, E: <b>{ear.graph.count.edges(origami)}</b>, F: <b>{ear.graph.count.faces(origami)}</b></p>

	{#if frames.length > 1}
		<p>
			frame: <span class="value">{selectedFrame+1}/{frames.length}</span>
		</p>
		<div>
			<input type="range" min={0} max={frames.length - 1} step="1" bind:value={selectedFrame}/>
		</div>
	{/if}

	<hr />

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
		<br />
		<span>front</span><input type="text" bind:value={frontColor} />
		<span>back</span><input type="text" bind:value={backColor} />
	{/if}

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
		width: 4rem;
	}
	.small { font-size: 0.8rem; }
</style>
