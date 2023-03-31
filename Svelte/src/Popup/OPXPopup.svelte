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
	<Popup pageNames={["size", "epsilon"]}>
		<button slot="title-bar" on:click={convertDidPress}>import</button>
		<CP slot="canvas" data={$uploadData} {epsilon} />
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
	h3 {
		margin: 0;
		padding: 0;
	}
	p, label {
		color: #bbb;
	}
	button {
		font-weight: bold;
		border: none;
		border-color: #49f;
		transition: color 0.25s, border-color 0.25s;
	}
	button:hover {
		color: #fff;
		border-color: #fff;
		transition: border-color 0s;
	}
	button:focus,
	button:focus-visible {
		outline: 4px auto -webkit-focus-ring-color;
	}
</style>
