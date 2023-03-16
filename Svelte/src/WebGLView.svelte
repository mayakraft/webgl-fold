<script>
	import {
		identity4x4,
		multiplyMatrices4,
		invertMatrix4,
		multiplyMatrix4Vector3,
		makeMatrix4Scale,
		makeMatrix4Translate,
	} from "rabbit-ear/math/algebra/matrix4.js";
	import { subtract } from "rabbit-ear/math/algebra/vector.js";
	import {
		quaternionFromTwoVectors,
		matrix4FromQuaternion,
	} from "rabbit-ear/math/algebra/quaternion.js";
	import {
		drawProgram,
		deallocProgram,
	} from "rabbit-ear/webgl/program.js";
	import initialize from "rabbit-ear/webgl/general/initialize.js";
	import {
		rebuildViewport,
		makeProjectionMatrix,
		makeModelMatrix,
	} from "rabbit-ear/webgl/general/view.js";
	import creasePattern from "rabbit-ear/webgl/creasePattern/index.js";
	import foldedForm from "rabbit-ear/webgl/foldedForm/index.js";
	import { onMount, onDestroy } from "svelte";
	import {
		makeViewMatrixFront,
		makeViewMatrixBack,
	} from "../../shared/view.js";
	import {
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
	} from "./stores/View.js";
	import { frame } from "./stores/File.js";

	const WebGLProgram = { creasePattern, foldedForm };

	const dragSpeed = 3.0;
	// Svelte will bind these. canvas to <canvas>
	let canvas;
	let { innerWidth, innerHeight } = window;
	// WebGL things
	let gl; // the WebGL instance
	let version; // which WebGL version was initialized: 1 or 2
	// let animationID;
	let programs = [];
	// gl matrices
	let projectionMatrix = identity4x4;
	let viewMatrix = identity4x4;
	let modelMatrix = identity4x4;
	// touch interaction
	let pressVector; // this is the location of the onPress. used in onMove.
	let pressViewMatrix; // onPress. used in onMove.
	let touchPoint = [0, 0]; // mouse pointer. used as input for shader
	let projectedTouch = [0, 0, 0]; // todo: get rid of this

	const draw = () => {
		if (!gl) { return; }
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		const uniforms = programs.map(prog => prog.makeUniforms(gl, {
			projectionMatrix, viewMatrix, modelMatrix, touchPoint, canvas, projectedTouch,
			strokeWidth: $strokeWidth,
			opacity: $opacity,
			frontColor: $frontColor,
			backColor: $backColor,
		}));
		programs.forEach((program, i) => drawProgram(gl, version, program, uniforms[i]));
	};

	const rebuildShaders = (graph) => {
		if (!gl) { return; }
		deallocPrograms();
		const options = {
			layerNudge: $layerNudge,
			outlines: $showFoldedFaceOutlines,
			edges: $showFoldedCreases,
			faces: $showFoldedFaces,
			B: [0.3, 0.3, 0.3],
			b: [0.3, 0.3, 0.3],
			V: [0.2, 0.4, 0.6],
			v: [0.2, 0.4, 0.6],
			M: [0.75, 0.25, 0.15],
			m: [0.75, 0.25, 0.15],
			F: [0.4, 0.4, 0.4],
			f: [0.4, 0.4, 0.4],
			J: [0.2, 0.2, 0.2],
			j: [0.2, 0.2, 0.2],
			C: [1.0, 0.75, 0.25],
			c: [1.0, 0.75, 0.25],
			U: [0.6, 0.25, 0.9],
			u: [0.6, 0.25, 0.9],
		};
		programs = [...WebGLProgram[$viewClass](gl, version, graph, options)];
		// programs.push(...TouchIndicators(gl, version));
	};

	const deallocPrograms = () => {
		programs.forEach(program => deallocProgram(gl, program));
		while (programs.length) { programs.pop(); }
	};

	const rebuildAllAndDraw = () => {
		rebuildViewport(gl, canvas);
		rebuildShaders($frame);
		projectionMatrix = makeProjectionMatrix(canvas, $perspective, $fov);
		viewMatrix = $flipCameraZ ? makeViewMatrixBack() : makeViewMatrixFront();
		modelMatrix = makeModelMatrix($frame);
		draw();
	};

	const rebuildModelAndDraw = () => {
		rebuildShaders($frame);
		draw();
	};

	const rebuildProjectionAndDraw = () => {
		rebuildViewport(gl, canvas);
		projectionMatrix = makeProjectionMatrix(canvas, $perspective, $fov);
		draw();
	};

	$: rebuildModelAndDraw($layerNudge, $showFoldedCreases, $showFoldedFaces, $showFoldedFaceOutlines);
	$: rebuildProjectionAndDraw(innerWidth, innerHeight, $fov);
	$: rebuildAllAndDraw($frame, $viewClass, $perspective, $flipCameraZ);
	$: draw($strokeWidth, $opacity, $frontColor, $backColor);

	onMount(() => {
		canvas.addEventListener("mousedown", onPress, false);
		canvas.addEventListener("mousemove", onMove, false);
		canvas.addEventListener("mouseup", onRelease, false);
		canvas.addEventListener("wheel", onScroll, false);
		canvas.addEventListener("ontouchstart", onPress, false);
		canvas.addEventListener("ontouchmove", onMove, false);
		canvas.addEventListener("ontouchend", onRelease, false);
		// force a particular WebGL version
		// const init = initialize(canvas, 1); // WebGL version 1
		// const init = initialize(canvas, 2); // WebGL version 2
		const init = initialize(canvas);
		gl = init.gl;
		version = init.version;
		if (!gl) {
			const msg = "WebGL is not supported.";
			alert(msg);
			throw new Error(msg);
		}

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		rebuildAllAndDraw();
		// const animate = () => {
		// 	animationID = window.requestAnimationFrame(animate);
		// 	draw();
		// };
		// animate();
		console.log(`using WebGL ${version}`);
	});


	onDestroy(() => {
		deallocPrograms();
		// dealloc webgl after this (possibly unnecessary)
		// gl.getExtension('WEBGL_lose_context').loseContext();
		// window.cancelAnimationFrame(animationID);
	});
	/**
	 * "matrix" is attitude matrix, not projection matrix
	 * matrix A, matrix B
	 */
	const vectorFromScreenLocation = (point, canvasSize, M = viewMatrix, scale = 1) => {
		const matrix = multiplyMatrices4(projectionMatrix, M);
		const inverse = invertMatrix4(matrix);
		const scaled = [0, 1].map(i => point[i] / canvasSize[i]);
		const centerScreen = [-2,0,0,0,0,2,0,0,0,0,1,0,1,-1,0,1];
		// const screen = [
		// 	2.0 * (0.5 - scaled[0]),
		// 	2.0 * (scaled[1] - 0.5),
		// 	1.0
		// ];
		// const screen = multiplyMatrix4Vector3(centerScreen, [...scaled, 1]);
		const screen = multiplyMatrix4Vector3(
			makeMatrix4Scale([scale, scale, 1]),
			multiplyMatrix4Vector3(centerScreen, [...scaled, 1]),
		);
		const res = multiplyMatrix4Vector3(inverse, screen);
		return res;
	};

	const onPress = (e) => {
		e.preventDefault();
		pressViewMatrix = [...viewMatrix];
		pressVector = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
			pressViewMatrix,
			$perspective === "perspective" ? dragSpeed : 1,
		);
	};

	const onMove = (e) => {
		e.preventDefault();
		const devicePixelRatio = window.devicePixelRatio || 1;
		if (!pressVector) { 
			touchPoint = [e.offsetX, e.offsetY].map(n => n * devicePixelRatio);
			projectedTouch = vectorFromScreenLocation(
				[e.offsetX, e.offsetY],
				[canvas.clientWidth, canvas.clientHeight],
				viewMatrix,
			);
			draw();
			return;
		}
		const nowVector = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
			pressViewMatrix,
			$perspective === "perspective" ? dragSpeed : 1,
		);
		switch ($perspective) {
			case "perspective": {
				const quaternion = quaternionFromTwoVectors(pressVector, nowVector);
				const matrix = matrix4FromQuaternion(quaternion);
				viewMatrix = multiplyMatrices4(pressViewMatrix, matrix);
			} break;
			case "orthographic": {
				const vector = subtract(nowVector, pressVector);
				const translate = makeMatrix4Translate(...vector);
				const matrix = invertMatrix4(translate);
				viewMatrix = multiplyMatrices4(pressViewMatrix, matrix);
			} break;
		}
		touchPoint = [e.offsetX, e.offsetY].map(n => n * devicePixelRatio);
		projectedTouch = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
			viewMatrix,
		);
		draw();
	};

	const onScroll = (e) => {
		e.preventDefault();
		const devicePixelRatio = window.devicePixelRatio || 1;
		const scrollSensitivity = 1 / 100;
		const delta = -e.deltaY * scrollSensitivity;
		if (Math.abs(delta) < 1e-3) { return false; }
		switch ($perspective) {
			case "perspective": {
				const translateMatrix = makeMatrix4Translate(0, 0, delta);
				viewMatrix = multiplyMatrices4(translateMatrix, viewMatrix);
			} break;
			case "orthographic": {
				const scale = 1 + delta;
				const scaleMatrix = makeMatrix4Scale([scale, scale, scale]);
				viewMatrix = multiplyMatrices4(scaleMatrix, viewMatrix);
			} break;
		}
		touchPoint = [e.offsetX, e.offsetY].map(n => n * devicePixelRatio);
		projectedTouch = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
			viewMatrix,
		);
		draw();
		return false;
	};

	const onRelease = () => {
		pressVector = undefined;
		pressViewMatrix = undefined;
	};

</script>

<svelte:window 
	bind:innerWidth
	bind:innerHeight
/>

<div>
	<canvas bind:this="{canvas}"></canvas>
</div>

<style>
	div {
		height: 100%;
		overflow-y: hidden;
	}
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
