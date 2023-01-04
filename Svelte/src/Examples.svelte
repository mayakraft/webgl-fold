<script>
	import { onMount } from "svelte";

	// example FOLD files
	import craneCP from "../../fold/crane-cp.fold?raw";
	import craneCP100 from "../../fold/crane-cp-100.fold?raw";
	import craneFolded from "../../fold/crane-folded.fold?raw";
	import craneFolded100 from "../../fold/crane-folded-100.fold?raw";
	import bird3d from "../../fold/bird-3d.fold?raw";
	import moosers3d from "../../fold/moosers-train-3d.fold?raw";
	import blintzFrames from "../../fold/blintz-frames.fold?raw";
	// import huffman from "../../fold/huffman.fold?raw";
	// import mazeFolding from "../../fold/maze-folding.fold?raw";
	import polygami from "../../fold/polygami.fold?raw";
	import polygami800 from "../../fold/polygami-800.fold?raw";
	import squareTwist from "../../fold/square-twist-frames.fold?raw";
	import squareTwists from "../../fold/square-twists.fold?raw";
	import threeFold from "../../fold/three-fold.fold?raw";
	import kraftBird from "../../fold/kraft-bird-base-06-mvf.fold?raw";
	import waterbomb3D from "../../fold/waterbomb-3d.fold?raw";

	export let loadFOLD = () => {};

	export let selectedExample;
	$: selectedExample == null
		? (() => {})()
		: loadFOLD(JSON.parse(exampleData[selectedExample]));

	const exampleData = {
		craneCP, craneCP100, craneFolded, craneFolded100, bird3d, moosers3d, blintzFrames,
		polygami, polygami800, squareTwist, squareTwists, threeFold, kraftBird, waterbomb3D,
		// huffman, mazeFolding, 
	};
	const examples = [
		{ text: "cp: crane 1x", data: "craneCP" },
		{ text: "cp: crane 100x", data: "craneCP100" },
		{ text: "cp: bird", data: "kraftBird" },

		{ text: "folded: 2D simple", data: "threeFold" },
		{ text: "folded: 2D crane", data: "craneFolded" },
		{ text: "folded: 2D crane 100x", data: "craneFolded100" },
		{ text: "folded: 2D square twists (currently broken)", data: "squareTwists" },

		{ text: "folded: 3D waterbomb (rotate it)", data: "waterbomb3D" },
		{ text: "folded: 3D flapping bird", data: "bird3d" },
		{ text: "folded: 3D moser's train", data: "moosers3d" },
		// { text: "folded: 3D huffman", data: "huffman" },
		// { text: "folded: 3D maze folding", data: "mazeFolding" },
		{ text: "folded: 3D polygami", data: "polygami" },
		{ text: "folded: 3D polygami 800x", data: "polygami800" },

		{ text: "frames: blintz base", data: "blintzFrames" },
		{ text: "frames: 3D square twist", data: "squareTwist" },
	];

	// load example on start
	// onMount(() => selectedExample = "craneCP");
	onMount(() => selectedExample = "craneFolded");
	// onMount(() => selectedExample = "threeFold");

</script>

	<h3>example:</h3>
	<select bind:value={selectedExample}>
		{#each examples as example}
			<option value={example.data}>
				{example.text}
			</option>
		{/each}
	</select>

<style>
	h3 {
		margin: 0;
		padding: 0;
	}
</style>
