<script>
	import { onMount } from "svelte";

	import craneCP from "../../../fold/crane-cp.fold?raw";
	import birdCP from "../../../fold/kraft-bird-base.fold?raw";
	import craneFolded from "../../../fold/crane-folded.fold?raw";
	import moosersTrain from "../../../fold/moosers-train.fold?raw";
	import polygami from "../../../fold/polygami.fold?raw";
	import blintzFrames from "../../../fold/blintz-frames.fold?raw";
	import kabuto from "../../../fold/kabuto.fold?raw";

	export let loadFOLD = () => {};

	export let selectedExample = "placeholder";
	$: selectedExample == null || selectedExample === "placeholder"
		? (() => {})()
		: loadFOLD(JSON.parse(exampleData[selectedExample]));

	const exampleData = {
		craneCP, birdCP, craneFolded, moosersTrain,
		blintzFrames, kabuto, polygami,
	};
	const examples = [
		{ text: "crease pattern: crane", data: "craneCP" },
		{ text: "crease pattern: bird", data: "birdCP" },
		{ text: "folded: crane", data: "craneFolded" },
		{ text: "folded: Mooser's train", data: "moosersTrain" },
		{ text: "folded: polygami", data: "polygami" },
		{ text: "frames: kabuto", data: "kabuto" },
		{ text: "frames: blintz base", data: "blintzFrames" },
	];

	// load example on start
	// onMount(() => selectedExample = "craneFolded");
	onMount(() => selectedExample = "placeholder");

</script>

	<select bind:value={selectedExample}>
    <option value="placeholder" disabled selected>load example</option>
		{#each examples as example}
			<option value={example.data}>
				{example.text}
			</option>
		{/each}
	</select>
