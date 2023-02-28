<script>
	import {
		FOLD,
		frames,
		frame,
		frameIndex,
	} from "./stores/File.js";
	import {
		perspective,
		viewClass,
		strokeWidth,
		layerNudge,
	} from "./stores/View.js";
	import { flattenFrame } from "rabbit-ear/graph/fileFrames.js";

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

	const getFileFrames = (foldFile) => !foldFile.file_frames
		? [flattenFrame(foldFile, 0)]
		: Array.from(Array(foldFile.file_frames.length + 1))
			.map((_, i) => flattenFrame(foldFile, i));


	const solver3dLayers = (graph) => {
		if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return; }
		const solutions = ear.layer.solver(graph);
		console.log("solutions", solutions);
		// console.log(solutions.count(), "solutions", solutions);
		// const allSolutions = solutions.allSolutions();
		// console.log("allSolutions", allSolutions);
		// const solution = solutions.solution();
		// console.log("solution", solution);
		// return solution;
		const solution = solutions.anySolution();
		console.log("solution", solution);
		return solution;
		// return solutions.solution(8);
		// const orders = solutions.map(el => el.faceOrders());
		// console.log("orders", orders);
		// const faceOrders = [].concat(...orders);
		// console.log("faceOrders", faceOrders);
		// return faceOrders;
	};
	const solver2dLayers = (graph) => {
		if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return; }
		ear.graph.populate(graph);
		const solver = ear.layer.solver2d(graph);
		console.log("solver", solver);
		return solver.faceOrders;
	};

	// const getFileFrames = (foldFile) => {
	// 	// solver3dLayers(foldFile);
	// 	// solver2dLayers(foldFile);
	// 	// foldFile.faceOrders = solver3dLayers(foldFile);
	// 	// foldFile.faceOrders = solver2dLayers(foldFile);
	// 	return !foldFile.file_frames
	// 		? [flattenFrame(foldFile, 0)]
	// 		: Array.from(Array(foldFile.file_frames.length + 1))
	// 			.map((_, i) => flattenFrame(foldFile, i));
	// };

	$: {
		$frameIndex = 0;
		$frames = getFileFrames($FOLD);
		$frame = $frames[0];
	}

	$: {
		$frame = $frames[$frameIndex];
		updateViewSettings($frame);
	}

</script>