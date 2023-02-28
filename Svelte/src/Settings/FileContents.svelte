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
	} from "../stores/File.js";

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


	<!-- {#if $FOLD.file_spec}
		<p>FOLD spec: <span class="value">{$FOLD.file_spec}</span></p>
	{/if} -->

	{#if $FOLD.file_title}
		<p>file title: <span class="value">{$FOLD.file_title}</span></p>
	{/if}

	{#if $FOLD.file_author}
		<p>file author: <span class="value">{$FOLD.file_author}</span></p>
	{/if}

	{#if $FOLD.file_creator}
		<p>file creator: <span class="value">{$FOLD.file_creator}</span></p>
	{/if}

	{#if $FOLD.file_description}
		<p>file description: <span class="value">{$FOLD.file_description}</span></p>
	{/if}

	{#if $FOLD.file_classes}
		<p>
			file classes:
			{#each $FOLD.file_classes as str}
				<span class="pill">{str}</span>
			{/each}
		</p>
	{/if}

	{#if $frame.frame_title}
		<p>frame title: <span class="value">{$frame.frame_title}</span></p>
	{/if}

	{#if $frame.frame_author}
		<p>frame author: <span class="value">{$frame.frame_author}</span></p>
	{/if}

	{#if $frame.frame_description}
		<p>frame description: <span class="value">{$frame.frame_description}</span></p>
	{/if}

	{#if $frame.frame_unit}
		<p>frame unit: <span class="value">{$frame.frame_unit}</span></p>
	{/if}

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
</div>
{/if}

<style>
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
