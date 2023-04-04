<script>
	import { foldKeys } from "rabbit-ear/fold/keys.js";
	import { isFoldObject } from "rabbit-ear/fold/spec.js";
	import GeometryKey from "./GeometryKey.svelte";
	import {
		FOLD,
		frame,
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
</script>

{#if isFoldObject($FOLD)}
<div>
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
/*		opacity: 0.5;*/
	}
	.value {
		font-weight: bold;
/*		opacity: 1;*/
	}
	.pill {
		font-weight: bold;
		border-radius: 0.75rem;
		padding: 0 0.5rem;
	}
	:global(body) .pill {
		background-color: #ddd;
		color: #333;
	}
	:global(body.dark) .pill {
		background-color: #36393c;
		color: #ccc;
	}
	.warning {
		background-color: #46493c;
		color: #fb4;
	}
</style>
