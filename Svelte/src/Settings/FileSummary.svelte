<script>
	import count from "rabbit-ear/graph/count.js";
	import { isFoldObject } from "rabbit-ear/fold/spec.js";
	import {
		FOLD,
		frames,
		frameIndex,
		fileCanDownload,
	} from "../stores/File.js";

	let fileSize = 0;
	$: fileSize = JSON.stringify($FOLD).length / 1000;

	const downloadFOLD = () => {
		const a = document.createElement("a");
		a.style = "display: none";
		document.body.appendChild(a);
		const blob = new Blob([JSON.stringify($FOLD)], { type: "octet/stream" });
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = "origami.fold";
		a.click();
		window.URL.revokeObjectURL(url);
	};
</script>

{#if isFoldObject($FOLD)}

	<hr />

	<p><span class="value">{fileSize.toFixed(2)}</span> kb</p>

	{#if $frames.length > 1}
		<p>
			frame: <span class="value">{$frameIndex+1}/{$frames.length}</span>
		</p>
		<div>
			<input
				type="range"
				min=0
				max={$frames.length - 1}
				step=1
				bind:value={$frameIndex}/>
		</div>
		<p>vertices: <span class="value">{count.vertices($FOLD)}</span>, edges: <span class="value">{count.edges($FOLD)}</span>, faces: <span class="value">{count.faces($FOLD)}</span></p>
	{:else}
		<p>vertices: <span class="value">{count.vertices($FOLD)}</span>, edges: <span class="value">{count.edges($FOLD)}</span>, faces: <span class="value">{count.faces($FOLD)}</span></p>
	{/if}

	{#if $fileCanDownload}
		<div class="download-button">
			<button on:click={downloadFOLD}>download file</button>
		</div>
	{/if}

{/if}

<style>
	button {
		width: 100%;
		padding: 0;
	}
	hr {
		margin: 0.125rem 0;
	}
	p {
		font-size: 0.8rem;
		line-height: 1rem;
		word-break: break-word;
	}
	.value {
		font-weight: bold;
	}
	.download-button {
		margin: 0.2rem 0;
		text-align: center;
	}
</style>
