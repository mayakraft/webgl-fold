<script>
	import {
		FOLD,
		frame,
	} from "../stores/File.js";
	import {
		colorMode,
		perspective,
		fov,
		flipCameraZ,
		viewClass,
		strokeWidth,
		opacity,
		frontColor,
		backColor,
		showFoldedCreases,
		showFoldedFaces,
		showFoldedFaceOutlines,
		layerNudge,
	} from "../stores/View.js";
	import { averageEdgeLength } from "../../../shared/graph.js";
	import { boundingBox } from "rabbit-ear/graph/boundary.js";

	let strokeWidthSlider = 5;
	$: $strokeWidth = Math.pow(2, strokeWidthSlider) / 1e5;

	let layerNudgeSlider = 6;
	$: $layerNudge = Math.pow(2, layerNudgeSlider) / 1e6;

	const updateSliders = (graph) => {
		const avgEdgeLen = averageEdgeLength(graph);
		// invert this: Math.pow(2, strokeWidthSlider) / 1e5;
		strokeWidthSlider = !avgEdgeLen
			? 0.1
			: Math.log2((avgEdgeLen * 0.02) * 1e5);
		$strokeWidth = Math.pow(2, strokeWidthSlider) / 1e5;
		// find a decent spacing between layers (layerNudge)
		const bounds = boundingBox(graph);
		if (bounds && bounds.span) {
			const maxSpan = Math.max(...bounds.span);
			layerNudgeSlider = Math.log2((maxSpan * 0.001) * 1e5);
			$layerNudge = Math.pow(2, layerNudgeSlider) / 1e6;
		}
	};

	$: {
		window.document.body.classList.remove("light");
		window.document.body.classList.remove("dark");
		window.document.body.classList.add($colorMode);
	}

	$: updateSliders($frame);
</script>

	<h3>theme</h3>
	<input
		type="radio"
		bind:group={$colorMode}
		name="radio-webgl-colorMode"
		id="radio-webgl-colorMode-light"
		value="light">
	<label for="radio-webgl-colorMode-light">light</label>
	<input
		type="radio"
		bind:group={$colorMode}
		name="radio-webgl-colorMode"
		id="radio-webgl-colorMode-dark"
		value="dark">
	<label for="radio-webgl-colorMode-dark">dark</label>

	<hr />

	<h3>viewport</h3>
	<input
		type="radio"
		bind:group={$perspective}
		name="radio-webgl-perspective"
		id="radio-webgl-perspective-orthographic"
		value="orthographic">
	<label for="radio-webgl-perspective-orthographic">orthographic</label>
	<input
		type="radio"
		bind:group={$perspective}
		name="radio-webgl-perspective"
		id="radio-webgl-perspective-perspective"
		value="perspective">
	<label for="radio-webgl-perspective-perspective">perspective</label>
	<br />
	{#if perspective === "perspective"}
		<span>field of view:</span>
		<input type="text" placeholder="field of view" bind:value={$fov}>
		<br/>
	{/if}
	<span>flip over</span>
	<input type="checkbox" bind:checked={$flipCameraZ} />

	<hr />

	<h3>style</h3>
	<input
		type="radio"
		name="radio-view-class"
		id="radio-view-class-cp"
		bind:group={$viewClass}
		value="creasePattern">
	<label for="radio-view-class-cp">crease pattern</label>
	<input
		type="radio"
		name="radio-view-class"
		id="radio-view-class-folded"
		bind:group={$viewClass}
		value="foldedForm">
	<label for="radio-view-class-folded">folded form</label>
	<br />
	{#if $viewClass === "creasePattern"}
		<span>stroke width</span><input
			type="range"
			min="1"
			max="20"
			step="0.01"
			bind:value={strokeWidthSlider} />
	{/if}
	{#if $viewClass === "foldedForm"}
		<!-- <span>opacity</span><input
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={$opacity} />
		<br /> -->
		<span>front</span><input type="text" bind:value={$frontColor} />
		<span>back</span><input type="text" bind:value={$backColor} />
	{/if}
	{#if $viewClass === "foldedForm"}
		<br/>
		<span>show faces</span>
		<input
			type="checkbox"
			bind:checked={$showFoldedFaces} />
		<br/>
		<span>face outlines</span>
		<input
			type="checkbox"
			bind:checked={$showFoldedFaceOutlines}
			disabled={!$showFoldedFaces} />
		<br/>
		<span>show creases</span>
		<input
			type="checkbox"
			bind:checked={$showFoldedCreases} />
		<br/>
		<span>stroke width</span><input
			type="range"
			min="1"
			max="20"
			step="0.01"
			bind:value={strokeWidthSlider}
			disabled={!$showFoldedCreases} />
		<br/>
	{/if}
	{#if $viewClass === "foldedForm" && $FOLD !== undefined}
		{#if $FOLD.faceOrders || $FOLD.faces_layer}

			<hr />

			<h3>overlapping faces</h3>
			<span>explode layers</span><input
				type="range"
				min="1"
				max="20"
				step="0.01"
				bind:value={layerNudgeSlider} />
			<br />
			<input type="text" class="long-input" bind:value={$layerNudge} />
		{/if}
	{/if}

<style>
	h3 {
		margin: 0;
		padding: 0;
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
</style>
