<script>
import { edgesAssignmentNames } from "rabbit-ear/fold/spec.js";
	import { onMount, onDestroy } from "svelte";
	export let assignments = {};
	// export let data = undefined;

	// $: console.log("assignments", assignments);

	const allAssignments = ["B", "M", "V", "F", "J", "C", "U"];
	// $: data && data.options ? console.log("data", data.options.assignments) : undefined;
</script>

<div class="container">
	{#each Object.keys(assignments) as stroke, i}
		<div>
			<select
				bind:value={assignments[stroke]}
				style="border: 1px solid {stroke}"
			>
				{#each allAssignments as assign}
					<option value={assign}>
						{edgesAssignmentNames[assign]}
					</option>
				{/each}
			</select>
			<span>{stroke}</span>
		</div>
	{/each}
</div>

<style>
	.container {
		max-height: 10rem;
		overflow-y: scroll;
	}
	span {
		margin-left: 0.5rem;
		color: #bbb;
	}
</style>
