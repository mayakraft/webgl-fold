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

	// which page is the popup on (show/hide epsilon)
	let pageIndex;

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

	const setDefaults = () => {
		epsilon = $uploadData.options.epsilon;
		epsilonSlider = Math.log2(epsilon * 10000);
		assignments = $uploadData.options.assignments;
	}

	$: setDefaults($uploadData);

	onMount(() => {
		if (bootLoop) {
			clearInterval(bootLoop);
		}
		bootLoop = setInterval(() => {
			if ($uploadData && $uploadData.edgeGraph) {
				setDefaults();
				clearInterval(bootLoop);
			}
		}, 50)
	});

	onDestroy(() => {
		if (bootLoop) {
			clearInterval(bootLoop);
		}
	});

</script>

{#if $uploadData && $uploadData.extension && $uploadData.edgeGraph}
	<Popup pageNames={["size", "colors", "boundary", "epsilon"]} bind:pageIndex={pageIndex}>
		<button slot="title-bar" on:click={convertDidPress}>import</button>
		<CP slot="canvas" data={$uploadData} {epsilon} showEpsilon={pageIndex === 3} />
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
	:global(body) p,
	:global(body) label { color: #333; }
	:global(body.dark) p,
	:global(body.dark) label { color: #bbb; }
	:global(body) .italic { color: #888; }
	:global(body.dark) .italic { color: #888; }
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
	.italic {
		font-style: italic;
	}
</style>
