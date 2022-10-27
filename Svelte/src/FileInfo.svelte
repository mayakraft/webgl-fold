<script>
	import ear from "rabbit-ear";

	export let FOLD = {};
	export let frames = [];
	export let selectedFrame = 0;

	const findNonSpecKeys = (fold) => {
		if (!fold) { return []; }
		const map = {};
		ear.graph.foldKeys.forEach(key => { map[key] = true; });
		return Object.keys(fold).filter(key => !map[key]);
	};

	let frame = {};
	$: frame = frames[selectedFrame];
	let nonSpecKeys = [];
	$: nonSpecKeys = findNonSpecKeys(frames[selectedFrame]);
</script>

<div>

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

	<!-- <hr /> -->

	<!--
	{#if FOLD.file_frames}
		<p>frames: <span class="value">{FOLD.file_frames.length}</span></p>
	{/if}
	 -->

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

</div>

<style>
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