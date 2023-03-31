<script>
	import count from "rabbit-ear/graph/count.js";
	import { foldKeys } from "rabbit-ear/fold/keys.js";
	import { isFoldObject } from "rabbit-ear/fold/spec.js";
	import GeometryKey from "./GeometryKey.svelte";
	import {
		FOLD,
		frames,
		frame,
		frameIndex,
		fileCanDownload,
	} from "../stores/File.js";
	import { prettify } from "../../../shared/strings.js";

	const findNonSpecKeys = (fold) => {
		if (!fold) { return []; }
		const map = {};
		Object.values(foldKeys)
			.forEach(arr => arr.forEach(key => { map[key] = true; }));
		return Object.keys(fold).filter(key => !map[key]);
	};

	let nonSpecKeys = [];
	$: nonSpecKeys = findNonSpecKeys($frame);

	let fileSize = 0;
	$: fileSize = JSON.stringify($FOLD).length / 1000;

	// file keys, besides file_classes and file_frames and file_spec
	const fileKeys = [
		"file_title",
		"file_author",
		"file_creator",
		"file_description",
	];

	// frame keys, besides frame_classes frame_attributes
	const frameKeys = [
		"frame_title",
		"frame_author",
		"frame_description",
		"frame_unit",
	];

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
<div>
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
		<hr />
	{:else}
		<p>vertices: <span class="value">{count.vertices($FOLD)}</span>, edges: <span class="value">{count.edges($FOLD)}</span>, faces: <span class="value">{count.faces($FOLD)}</span></p>
	{/if}

	{#each fileKeys as key}
		{#if $FOLD[key]}
			<p>{prettify(key)}: <span class="value">{$FOLD[key]}</span></p>
		{/if}
	{/each}

	{#if $FOLD.file_classes}
		<p>
			file classes:
			{#each $FOLD.file_classes as str}
				<span class="pill">{str}</span>
			{/each}
		</p>
	{/if}

	{#each frameKeys as key}
		{#if $frame[key]}
			<p>{prettify(key)}: <span class="value">{$frame[key]}</span></p>
		{/if}
	{/each}

	{#if $frame.frame_classes}
		<p>
			frame classes:
			{#each $frame.frame_classes as str}
				<span class="pill">{str}</span>
			{/each}
		</p>
	{/if}

	{#if frame.frame_attributes}
		<p>
			frame attributes:
			{#each $frame.frame_attributes as str}
				<span class="pill">{str}</span>
			{/each}
		</p>
	{/if}

	{#if nonSpecKeys.length}
		<p>
			non-spec keys:
			{#each nonSpecKeys as key}
				<span class="pill warning">{key}</span>
			{/each}
		</p>
	{/if}

	<hr />

	<GeometryKey key={"vertices_coords"} />
	<GeometryKey key={"vertices_vertices"} />
	<GeometryKey key={"vertices_edges"} />
	<GeometryKey key={"vertices_faces"} />
	<GeometryKey key={"edges_vertices"} />
	<GeometryKey key={"edges_faces"} />
	<GeometryKey key={"edges_assignment"} />
	<GeometryKey key={"edges_foldAngle"} />
	<GeometryKey key={"faces_vertices"} />
	<GeometryKey key={"faces_edges"} />
	<GeometryKey key={"faces_faces"} />
	<GeometryKey key={"faceOrders"} />


	{#if $fileCanDownload}
		<hr />
		<div class="download-button">
			<button on:click={downloadFOLD}>download file</button>
		</div>
	{/if}

</div>
{/if}

<style>
	.download-button {
		margin: 0.2rem 0;
		text-align: center;
	}
	hr {
		margin: 0.125rem 0;
	}
	div {
		max-width: 15rem;
	}
	p {
		font-size: 0.8rem;
		line-height: 1rem;
		word-break: break-word;
		color: #999;
	}
	.value {
		font-weight: bold;
		color: #ccc;
	}
	.pill {
		font-weight: bold;
		background-color: #36393c;
		color: #ccc;
		border-radius: 0.75rem;
		padding: 0 0.5rem;
	}
	.warning {
		background-color: #46493c;
		color: #fb4;
	}
</style>
