<script>
	import { onMount, onDestroy } from "svelte";

	export let loadFOLD = () => {};

	const loadFiles = (event) => {
		if (event.dataTransfer.items) {
			const transferFiles = [...event.dataTransfer.items]
				.filter(el => el.kind === "file")
				.map(el => el.getAsFile());
			if (transferFiles.length) {
				const reader = new FileReader();
				reader.onload = fileOnLoad;
				reader.readAsText(transferFiles[0]);
				return reader;
			}
		}
	};

	const fileOnLoad = (event) => {
		try {
			loadFOLD(JSON.parse(event.target.result));
		} catch (error) {
			window.alert(error);
		}
	};

	let isHovering = false;

	const dragenter = (e) => { isHovering = true; e.preventDefault(); };
	const dragleave = (e) => { isHovering = false; e.preventDefault(); };
	const dragover = (e) => { isHovering = true; e.preventDefault(); };
	const drop = (event) => {
		isHovering = false;
		event.preventDefault();
		event.stopPropagation();
		loadFiles(event);
	}

	onMount(() => {
		document.body.addEventListener("dragenter", dragenter, false);
		document.body.addEventListener("dragleave", dragleave, false);
		document.body.addEventListener("dragover", dragover, false);
		document.body.addEventListener("drop", drop, false);
	});
	onDestroy(() => {
		document.body.removeEventListener("dragenter", dragenter, false);
		document.body.removeEventListener("dragleave", dragleave, false);
		document.body.removeEventListener("dragover", dragover, false);
		document.body.removeEventListener("drop", drop, false);
	})
</script>

<div class={isHovering ? "dragging" : ""} />

<style>
	div {
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		outline: none;
		border: 3px solid transparent;
    border-radius: 0.25rem;
	}
	div.dragging {
		border-color: #fb4;
	}
</style>
