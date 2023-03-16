<script>
	import { onMount } from "svelte";
	import craneCP from "../../../fold/crane-cp.fold?raw";
	import birdCP from "../../../fold/kraft-bird-base.fold?raw";
	import craneFolded from "../../../fold/crane-folded.fold?raw";
	import moosersTrain from "../../../fold/moosers-train.fold?raw";
	import polygami from "../../../fold/polygami.fold?raw";
	import blintzFrames from "../../../fold/blintz-frames.fold?raw";
	import kabuto from "../../../fold/kabuto.fold?raw";
	import {
		FOLD,
		frameIndex,
		selectedExample,
		fileCanDownload,
	} from "../stores/File.js";

	const examples = {
		craneCP:      { data: craneCP,      text: "crease pattern: crane" },
		birdCP:       { data: birdCP,       text: "crease pattern: bird" },
		craneFolded:  { data: craneFolded,  text: "folded: crane" },
		moosersTrain: { data: moosersTrain, text: "folded: Mooser's train" },
		polygami:     { data: polygami,     text: "folded: polygami" },
		kabuto:       { data: kabuto,       text: "frames: kabuto" },
		blintzFrames: { data: blintzFrames, text: "frames: blintz base" },
	};

	$: if ($selectedExample != null && $selectedExample !== "placeholder") {
		$FOLD = JSON.parse(examples[$selectedExample].data);
		$frameIndex = 0;
		$fileCanDownload = false;
	}

	// load example on start
	// onMount(() => $selectedExample = "craneFolded");
	onMount(() => $selectedExample = "placeholder");

</script>

	<select bind:value={$selectedExample}>
    <option value="placeholder" disabled selected>load example</option>
		{#each Object.keys(examples) as example}
			<option value={example}>
				{examples[example].text}
			</option>
		{/each}
	</select>
