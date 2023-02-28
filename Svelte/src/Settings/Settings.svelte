<script>
	import Examples from "./Examples.svelte";
	import FileContents from "./FileContents.svelte";
	import StylePanel from "./StylePanel.svelte";
	import {
		FOLD,
		selectedExample,
		fileCanDownload,
	} from "../stores/File.js";

	let showFileContents = true;
	let showStyle = true;

	const fileDialogDidLoad = (string, filename, mimeType) => {
		try {
			$FOLD = JSON.parse(string);
			$selectedExample = "placeholder";
			$fileCanDownload = false;
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
	};

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

<div class="settings">
	<h3>load FOLD</h3>
	<input type="file" bind:files>

	<br />

	<Examples />

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
		<FileContents />
	{/if}

	{#if $fileCanDownload}
		<div class="download-button">
			<button on:click={downloadFOLD}>download modified</button>
		</div>
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
		<StylePanel />
	{/if}

</div>

<style>
	.download-button {
		margin: 0.2rem 0;
		text-align: center;
	}
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
