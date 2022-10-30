<script>
	import ear from "rabbit-ear";
	import { onMount, onDestroy } from "svelte";

	import CreasePattern from "../../src/programs/CreasePattern";
	import FoldedForm from "../../src/programs/FoldedForm";
	import TouchIndicators from "../../src/programs/TouchIndicators";
	import makeUniforms from "../../src/makeUniforms";
	import {
		drawProgram,
		deallocProgram,
	} from "../../src/programs";
	import {
		rebuildViewport,
		makeProjectionMatrix,
		makeViewMatrixFront,
		makeViewMatrixBack,
		makeModelMatrix,
	} from "../../src/general";

	export let origami = {};
	export let perspective = "orthographic";
	export let viewClass = "creasePattern";
	export let fov = 30;
	export let strokeWidth = 0.0025;
	export let layerNudge = 1e-5;
	export let opacity = 1.0;
	export let flipCameraZ = false;
	export let frontColor = "#5580ff";
	export let backColor = "#fff";

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
	let projectionMatrix = ear.math.identity4x4;
	let viewMatrix = ear.math.identity4x4;
	let modelMatrix = ear.math.identity4x4;
	// touch interaction
	let pressVector; // this is the location of the onPress. used in onMove.
	let pressViewMatrix; // onPress. used in onMove.
	let touchPoint = [0, 0]; // mouse pointer. used as input for shader
	let projectedTouch = [0, 0, 0]; // todo: get rid of this

	const draw = () => {
		if (!gl) { return; }
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		const uniforms = makeUniforms(gl, {
			projectionMatrix, viewMatrix, modelMatrix,
			strokeWidth, opacity, touchPoint, canvas, frontColor, backColor,
			projectedTouch,
		});
		programs.forEach(program => drawProgram(gl, version, program, uniforms));
	};

	const rebuildShaders = (graph) => {
		if (!gl) { return; }
		deallocPrograms();
		programs = [];
		switch(viewClass) {
			case "creasePattern":
				programs.push(...CreasePattern(gl, version, graph));
				break;
			case "foldedForm":
				programs.push(...FoldedForm(gl, version, graph, { layerNudge }));
				break;
			default: break;
		}
		// programs.push(...TouchIndicators(gl, version));
	};

	const deallocPrograms = () => {
		programs.forEach(program => deallocProgram(gl, program));
		while (programs.length) { programs.pop(); }
	};

	const rebuildAllAndDraw = () => {
		rebuildViewport(gl, canvas);
		rebuildShaders(origami);
		projectionMatrix = makeProjectionMatrix(canvas, perspective, fov);
		viewMatrix = flipCameraZ ? makeViewMatrixBack() : makeViewMatrixFront();
		modelMatrix = makeModelMatrix(origami);
		draw();
	};

	const rebuildModelAndDraw = () => {
		rebuildShaders(origami);
		draw();
	};

	const rebuildProjectionAndDraw = () => {
		rebuildViewport(gl, canvas);
		projectionMatrix = makeProjectionMatrix(canvas, perspective, fov);
		draw();
	};

	$: rebuildModelAndDraw(layerNudge);
	$: rebuildProjectionAndDraw(innerWidth, innerHeight, fov);
	$: rebuildAllAndDraw(origami, viewClass, perspective, flipCameraZ);
	$: draw(strokeWidth, opacity, frontColor, backColor);

	onMount(() => {
		canvas.addEventListener("mousedown", onPress, false);
		canvas.addEventListener("mousemove", onMove, false);
		canvas.addEventListener("mouseup", onRelease, false);
		canvas.addEventListener("wheel", onScroll, false);
		canvas.addEventListener("ontouchstart", onPress, false);
		canvas.addEventListener("ontouchmove", onMove, false);
		canvas.addEventListener("ontouchend", onRelease, false);
		// force a particular WebGL version
		// const init = ear.webgl.initialize(canvas, 1); // WebGL version 1
		// const init = ear.webgl.initialize(canvas, 2); // WebGL version 2
		const init = ear.webgl.initialize(canvas);
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
		const matrix = ear.math.multiplyMatrices4(projectionMatrix, M);
		const inverse = ear.math.invertMatrix4(matrix);
		const scaled = [0, 1].map(i => point[i] / canvasSize[i]);
		const centerScreen = [-2,0,0,0,0,2,0,0,0,0,1,0,1,-1,0,1];
		// const screen = [
		// 	2.0 * (0.5 - scaled[0]),
		// 	2.0 * (scaled[1] - 0.5),
		// 	1.0
		// ];
		// const screen = ear.math.multiplyMatrix4Vector3(centerScreen, [...scaled, 1]);
		const screen = ear.math.multiplyMatrix4Vector3(
			ear.math.makeMatrix4Scale([scale, scale, 1]),
			ear.math.multiplyMatrix4Vector3(centerScreen, [...scaled, 1]),
		);
		const res = ear.math.multiplyMatrix4Vector3(inverse, screen);
		return res;
	};

	const onPress = (e) => {
		e.preventDefault();
		pressViewMatrix = [...viewMatrix];
		pressVector = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
			pressViewMatrix,
			perspective === "perspective" ? dragSpeed : 1,
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
			perspective === "perspective" ? dragSpeed : 1,
		);
		switch (perspective) {
			case "perspective": {
				const quaternion = ear.math.quaternionFromTwoVectors(pressVector, nowVector);
				const matrix = ear.math.matrix4FromQuaternion(quaternion);
				viewMatrix = ear.math.multiplyMatrices4(pressViewMatrix, matrix);
			} break;
			case "orthographic": {
				const vector = ear.math.subtract(nowVector, pressVector);
				const translate = ear.math.makeMatrix4Translate(...vector);
				const matrix = ear.math.invertMatrix4(translate);
				viewMatrix = ear.math.multiplyMatrices4(pressViewMatrix, matrix);
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
		switch (perspective) {
			case "perspective": {
				const translateMatrix = ear.math.makeMatrix4Translate(0, 0, delta);
				viewMatrix = ear.math.multiplyMatrices4(translateMatrix, viewMatrix);
			} break;
			case "orthographic": {
				const scale = 1 + delta;
				const scaleMatrix = ear.math.makeMatrix4Scale([scale, scale, scale]);
				viewMatrix = ear.math.multiplyMatrices4(scaleMatrix, viewMatrix);
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

<canvas bind:this="{canvas}"></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
