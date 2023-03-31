<script>
	import {
		FOLD,
		frames,
		frame,
		frameIndex,
		uploadData,
	} from "../stores/File.js";
	import {
		perspective,
		viewClass,
		strokeWidth,
		layerNudge,
	} from "../stores/View.js";
	import DragAndDrop from "./DragAndDrop.svelte";
	import { flattenFrame } from "rabbit-ear/fold/fileFrames.js";
	import { averageEdgeLength } from "../../../shared/graph.js";
	import { boundingBox } from "rabbit-ear/graph/boundary.js";

	import SVGPopup from "../Popup/SVGPopup.svelte";
	import OPXPopup from "../Popup/OPXPopup.svelte";

	const getFileFrames = (foldFile) => !foldFile.file_frames
		? [flattenFrame(foldFile, 0)]
		: Array.from(Array(foldFile.file_frames.length + 1))
			.map((_, i) => flattenFrame(foldFile, i));

	const updateViewSettings = (graph) => {
		if (graph && graph.frame_classes) {
			if (graph.frame_classes.includes("creasePattern")) {
				$perspective = "orthographic";
				$viewClass = "creasePattern";
			} else if (graph.frame_classes.includes("foldedForm")) {
				$perspective = "perspective";
				$viewClass = "foldedForm";
			}
		}
	};

	const updateSliders = (graph) => {
		const avgEdgeLen = averageEdgeLength(graph);
		// invert this: Math.pow(2, strokeWidthSlider) / 100000;
		const strokeWidthSlider = !avgEdgeLen
			? 0.1
			: Math.log2((avgEdgeLen * 0.02) * 100000);
		$strokeWidth = Math.pow(2, strokeWidthSlider) / 100000;
		// find a decent spacing between layers (layerNudge)
		const bounds = boundingBox(graph);
		if (bounds && bounds.span) {
			const maxSpan = Math.max(...bounds.span);
			const layerNudgeSlider = Math.log2((maxSpan * 0.001) * 100000);
			$layerNudge = Math.pow(2, layerNudgeSlider) / 1000000;
		}
	};

	// this is the only place in the app that sets "frames"
	// also, this causes the block below to fire.
	$: {
		$frames = getFileFrames($FOLD);
		if ($frameIndex >= $frames.length) {
			$frameIndex = $frames.length - 1;
		}
	}

	// when "frameIndex" changes
	$: {
		$frame = $frames[$frameIndex] || {};
		updateViewSettings($frame);
		updateSliders($frame);
	}

</script>

{#if $uploadData.fold === undefined}
	{#if $uploadData.extension === "svg"}
		<SVGPopup />
	{:else if $uploadData.extension === "opx"}
		<OPXPopup />
	{/if}
{/if}

<DragAndDrop />
