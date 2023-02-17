<script>
	import ear from "rabbit-ear";
	import GeometryKey from "./GeometryKey.svelte";

	export let FOLD = {};
	export let frames = [];
	export let selectedFrame = 0;

	const findNonSpecKeys = (fold) => {
		if (!fold) { return []; }
		const map = {};
		Object.values(ear.graph.foldKeys)
			.forEach(arr => arr.forEach(key => { map[key] = true; }));
		return Object.keys(fold).filter(key => !map[key]);
	};

	let frame = {};
	$: frame = frames[selectedFrame];
	let nonSpecKeys = [];
	$: nonSpecKeys = findNonSpecKeys(frames[selectedFrame]);

	let fileLoaded = false;
	$: fileLoaded = ear.graph.isFoldObject(FOLD);

	let fileSize = 0;
	$: fileSize = JSON.stringify(FOLD).length / 1000;
</script>

{#if fileLoaded}
<div>
	<p><span class="value">{fileSize.toFixed(2)}</span> kb</p>

	{#if frames.length > 1}
		<p>
			frame: <span class="value">{selectedFrame+1}/{frames.length}</span>
		</p>
		<div>
			<input
				type="range"
				min=0
				max={frames.length - 1}
				step=1
				bind:value={selectedFrame}/>
		</div>
		<hr />
	{/if}


	<p>vertices: <span class="value">{ear.graph.count.vertices(FOLD)}</span>, edges: <span class="value">{ear.graph.count.edges(FOLD)}</span>, faces: <span class="value">{ear.graph.count.faces(FOLD)}</span></p>

	{#if FOLD.file_spec}
		<p>FOLD spec: <span class="value">{FOLD.file_spec}</span></p>
	{/if}

	{#if FOLD.file_title}
		<p>file title: <span class="value">{FOLD.file_title}</span></p>
	{/if}

	{#if FOLD.file_author}
		<p>file author: <span class="value">{FOLD.file_author}</span></p>
	{/if}

	{#if FOLD.file_creator}
		<p>file creator: <span class="value">{FOLD.file_creator}</span></p>
	{/if}

	{#if FOLD.file_description}
		<p>file description: <span class="value">{FOLD.file_description}</span></p>
	{/if}

	{#if FOLD.file_classes}
		<p>
			file classes:
			{#each FOLD.file_classes as str}
				<span class="pill">{str}</span>
			{/each}
		</p>
	{/if}

	{#if frame.frame_title}
		<p>frame title: <span class="value">{frame.frame_title}</span></p>
	{/if}

	{#if frame.frame_author}
		<p>frame author: <span class="value">{frame.frame_author}</span></p>
	{/if}

	{#if frame.frame_description}
		<p>frame description: <span class="value">{frame.frame_description}</span></p>
	{/if}

	{#if frame.frame_unit}
		<p>frame unit: <span class="value">{frame.frame_unit}</span></p>
	{/if}

	{#if frame.frame_classes}
		<p>
			frame classes:
			{#each frame.frame_classes as str}
				<span class="pill">{str}</span>
			{/each}
		</p>
	{/if}

	{#if frame.frame_attributes}
		<p>
			frame attributes:
			{#each frame.frame_attributes as str}
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

	<GeometryKey bind:FOLD={FOLD} key={"vertices_coords"} />
	<GeometryKey bind:FOLD={FOLD} key={"vertices_vertices"} />
	<GeometryKey bind:FOLD={FOLD} key={"vertices_edges"} />
	<GeometryKey bind:FOLD={FOLD} key={"vertices_faces"} />
	<GeometryKey bind:FOLD={FOLD} key={"edges_vertices"} />
	<GeometryKey bind:FOLD={FOLD} key={"edges_faces"} />
	<GeometryKey bind:FOLD={FOLD} key={"edges_assignment"} />
	<GeometryKey bind:FOLD={FOLD} key={"edges_foldAngle"} />
	<GeometryKey bind:FOLD={FOLD} key={"faces_vertices"} />
	<GeometryKey bind:FOLD={FOLD} key={"faces_edges"} />
	<GeometryKey bind:FOLD={FOLD} key={"faces_faces"} />
	<GeometryKey bind:FOLD={FOLD} key={"faceOrders"} />
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
