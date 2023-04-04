<script>
	import { makeComponent } from "../../../shared/graph.js";
	import { prettify } from "../../../shared/strings.js";
	import {
		frame,
		modifyFrame,
	} from "../stores/File.js";

	export let key = "";

	const generateGeometry = () => modifyFrame(makeComponent($frame, key));
</script>

	<p>
		{#if $frame[key]}
			<span class="included">{prettify(key)}: ✓</span>
		{/if}
		{#if !$frame[key]}
			<span>{prettify(key)}:</span>
			<button
				disabled={key === "faceOrders" ? true : false}
				on:click={generateGeometry}
			>generate</button>
		{/if}
	</p>

<style>
	:global(body) span { color: #888; }
	:global(body.dark) span { color: #aaa; }
	:global(body) .included { color: black; }
	:global(body.dark) .included { color: rgba(255, 255, 255, 0.87); }
	p {
		margin: 0;
		padding: 0;
		font-size: 0.8rem;
		line-height: 1rem;
		word-break: break-word;
	}
	button {
		line-height: 0.65rem;
	}
	button[disabled] {
		color: #999;
		cursor: default;
	}
	button[disabled]:hover {
		border-color: transparent;
	}
</style>
