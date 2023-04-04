<script>
	import {
		uploadData,
		completeFileImport,
	} from "../stores/File.js";
	import { onMount, onDestroy } from "svelte";
	import CP from "./CP.svelte";
	import Popup from "./Popup.svelte";

	let epsilonSlider = 10;
	let bootLoop;

	let epsilon;
	// let yFlip = false;

	// which page is the popup on (show/hide epsilon)
	let pageIndex;

	const convertDidPress = () => {
		$uploadData.options = { epsilon };
		// $uploadData.options = { epsilon, yFlip };
		completeFileImport();
	}

	$: epsilon = Math.pow(2, epsilonSlider) / 10000;

	onMount(() => {
		if (bootLoop) { clearInterval(bootLoop); }
		bootLoop = setInterval(() => {
			if ($uploadData && $uploadData.edgeGraph) {
				epsilonSlider = Math.log2(($uploadData.options.epsilon) * 10000);
				clearInterval(bootLoop);
			}
		}, 50)
	});
	onDestroy(() => {
		if (bootLoop) { clearInterval(bootLoop); }
	});

</script>

{#if $uploadData && $uploadData.extension && $uploadData.edgeGraph}
	<Popup pageNames={["size", "epsilon"]} bind:pageIndex={pageIndex}>>
		<button slot="title-bar" on:click={convertDidPress}>import</button>
		<CP slot="canvas" data={$uploadData} {epsilon} showEpsilon={pageIndex === 1} />
		<div slot="page-0">
			<h3>dimensions</h3>
			<p>{$uploadData.boundingBox.span
				.slice(0, 2)
				.map(n => n.toFixed(3))
				.join(" × ")}</p>
			<!-- <input type="checkbox" id="checkbox-y-flip" bind:checked={yFlip}><label for="checkbox-y-flip">flip y-axis</label> -->
		</div>
		<div slot="page-1">
			<h3>epsilon</h3>
			<p>suggested: {$uploadData.options.epsilon.toFixed(3)}</p>
			<input type="text" bind:value={epsilon}>
			<br />
			<input
				type="range"
				min="1"
				max="20"
				step="0.01"
				bind:value={epsilonSlider}>
			<slot name="content"></slot>
		</div>
	</Popup>
{/if}

<style>
	:global(body) p { color: #666; }
	:global(body.dark) p { color: #bbb; }
	:global(body) button { color: black; }
	:global(body.dark) button { color: #39f; }
	:global(body) button:hover { color: #39f; }
	:global(body.dark) button:hover { color: white; }
	h3 {
		margin: 0;
		padding: 0;
	}
	button {
		border: none;
		font-weight: bold;
		transition: color 0.25s;
	}
	button:hover {
		transition: border-color 0s;
	}
	button:focus,
	button:focus-visible {
		outline: 4px auto -webkit-focus-ring-color;
	}
</style>
