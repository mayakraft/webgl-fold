<script>
	import {
		uploadData,
		completeFileImport,
	} from "../stores/File.js";
	import { onMount, onDestroy } from "svelte";
	import Popup from "./Popup.svelte";
	import CP from "./CP.svelte";
	import ColorsList from "./ColorsList.svelte";

	let epsilonSlider = 10;
	let bootLoop;

	let assignments = {};
	let epsilon;
	let boundary = true;
	let yFlip = false;

	const convertDidPress = () => {
		$uploadData.options = {
			assignments,
			epsilon,
			boundary,
			yFlip,
		};
		completeFileImport();
	}

	$: epsilon = Math.pow(2, epsilonSlider) / 10000;

	const ASSIGNMENTS = {
		boundary: ["B", "b"],
		mountain: ["M", "m"],
		valley: ["V", "v"],
		flat: ["F", "f"],
		cut: ["C", "c"],
		join: ["J", "j"],
		unassigned: ["U", "u"],
	};
	let edgeSummary;
	$: edgeSummary = $uploadData && $uploadData.edgeGraph && $uploadData.edgeGraph.edges_assignment
		? Object.keys(ASSIGNMENTS)
			.map(key => $uploadData.edgeGraph.edges_assignment
				.filter(a => ASSIGNMENTS[key].includes(a)).length)
			.map((count, i) => ({ count, key: Object.keys(ASSIGNMENTS)[i] }))
			.filter(el => el.count > 0)
			.map(el => `${el.key}: ${el.count}`)
		: "";

	// $: {
	// 	if ($uploadData && $uploadData.edgeGraph) {
	// 		// $: epsilon = Math.pow(2, epsilonSlider) / 10000;
	// 		epsilonSlider = Math.log2(($uploadData.epsilon) * 10000);
	// 		console.log("setting epsilon slider", Math.log2(($uploadData.epsilon) * 10000));
	// 	}
	// }

	onMount(() => {
		if (bootLoop) { clearInterval(bootLoop); }
		bootLoop = setInterval(() => {
			if ($uploadData && $uploadData.edgeGraph) {
				epsilonSlider = Math.log2(($uploadData.options.epsilon) * 10000);
				assignments = $uploadData.options.assignments;
				clearInterval(bootLoop);
			}
		}, 50)
	});
	onDestroy(() => {
		if (bootLoop) { clearInterval(bootLoop); }
	});

</script>

{#if $uploadData && $uploadData.extension && $uploadData.edgeGraph}
	<Popup pageNames={["size", "colors", "boundary", "epsilon"]}>
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
			<h3>{$uploadData.edgeGraph.edges_vertices.length} straight lines</h3>
			{#if $uploadData.svg}
				<ColorsList bind:assignments={assignments} />
			{/if}
			{#each edgeSummary as summary}
			<!-- <p>{summary}</p> -->
			{/each}
		</div>
		<div slot="page-2">
			<h3>boundary</h3>
			<input type="checkbox" id="checkbox-boundary" bind:checked={boundary}><label for="checkbox-boundary">find boundary</label>
			{#if boundary}
				<p class="italic">walk around the outer boundary and reassign these edges</p>
			{:else}
				<p class="italic">all black lines will be assigned boundary</p>
			{/if}
		</div>
		<div slot="page-3">
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
	.italic {
		color: #888;
		font-style: italic;
	}
</style>
