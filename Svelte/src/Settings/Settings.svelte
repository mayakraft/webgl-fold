<script>
	import Examples from "./Examples.svelte";
	import FileContents from "./FileContents.svelte";
	import StylePanel from "./StylePanel.svelte";

	export let origami = {};
	export let frames = [];
	export let selectedFrame = 0;
	export let perspective = "orthographic";
	export let viewClass = "creasePattern";
	export let layerNudge = 1e-5;
	export let opacity = 1.0;
	export let fov = 30;
	export let flipCameraZ = false;
	export let frontColor = "#57f";
	export let backColor = "#fff";
	export let showFoldedCreases = false;
	export let showFoldedFaces = true;
	export let showFoldedFaceOutlines = true;
	export let loadFOLD = () => {};

	export let strokeWidthSlider;
	export let layerNudgeSlider;

	let selectedExample;
	let showFileContents = true;
	let showStyle = false;

	const fileDialogDidLoad = (string, filename, mimeType) => {
		try {
			loadFOLD(JSON.parse(string));
			selectedExample = null;
		}
		catch (error) { window.alert(error); }
	};

	let files;
	$: if (files) {
		const file = files[0];
		let mimeType, filename;
		const reader = new FileReader();
		reader.onload = loadEvent => fileDialogDidLoad(loadEvent.target.result, filename, mimeType);
		if (files.length) {
			mimeType = files[0].type;
			filename = files[0].name;
			reader.readAsText(files[0]);
		}
	}

</script>

<div class="settings">
	<h3>load FOLD</h3>
	<input type="file" bind:files>

	<!-- <hr /> -->
	<br />

	<Examples {loadFOLD} bind:selectedExample={selectedExample} />

	<div
		class="dropdown"
		on:click={() => showFileContents = !showFileContents}>
		<h3>file contents</h3>
		{#if showFileContents}
			<span class="triangle">▼</span>
		{/if}
		{#if !showFileContents}
			<span class="triangle rotated">▼</span>
		{/if}
	</div>

	{#if showFileContents}
		<FileContents
			FOLD={origami}
			{frames}
			{selectedFrame}
		/>
	{/if}

	<div
		class="dropdown"
		on:click={() => showStyle = !showStyle}>
		<h3>style</h3>
		{#if showStyle}
			<span class="triangle">▼</span>
		{/if}
		{#if !showStyle}
			<span class="triangle rotated">▼</span>
		{/if}
	</div>

	{#if showStyle}
		<StylePanel
			{origami}
			{frames}
			{selectedFrame}
			{perspective}
			{viewClass}
			{layerNudge}
			{opacity}
			{fov}
			{flipCameraZ}
			{frontColor}
			{backColor}
			{showFoldedCreases}
			{showFoldedFaces}
			{showFoldedFaceOutlines}
			{strokeWidthSlider}
			{layerNudgeSlider}
		/>
	{/if}

</div>

<style>
	.settings {
		background-color: #0002;
		z-index: 2;
		position: absolute;
		top: 0;
		left: 0;
		padding: 0.5rem;
		overflow-y: auto;
		max-height: 100vh;
	}
	h3 {
		margin: 0;
		padding: 0;
	}
	.dropdown {
		text-transform: uppercase;
		letter-spacing: 0.15rem;
		background-color: #4444;
		margin: 0.25rem -0.5rem;
		padding: 0rem 0.5rem;
		border: 0 solid #666;
		border-top-width: 1px;
		border-bottom-width: 1px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		cursor: pointer;
	}
	.dropdown:hover {
		background-color: #6664;
	}
	.dropdown h3 {
		font-size: 1rem;
	}
	input[type=text] {
		width: 4rem;
	}
	input[type=text].long-input {
		width: 8rem;
	}
	span + input[type=text] {
		margin-left: 0.5rem;
	}
	span.rotated {
		transform: rotate(90deg);
	}
</style>
