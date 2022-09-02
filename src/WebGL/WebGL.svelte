<script>
	import ear from "rabbit-ear";
	import { onMount, onDestroy } from "svelte";
	import CreasePattern from "./CreasePattern";
	import FoldedForm from "./FoldedForm";
	import TouchIndicators from "./TouchIndicators";

	export let origami = {};
	export let perspective = "orthographic";
	export let viewClass = "creasePattern";
	export let fov = 45;
	export let strokeWidth = 0.0025;
	let dragSpeed = 8.0;
	let { innerWidth, innerHeight } = window;

	// webgl, hold onto these so we can dealloc them later
	let gl, version;
	let animationID;
	let shaders = [];
	let canvas;
	let projectionMatrix = ear.math.identity4x4;
	let viewMatrix = ear.math.identity4x4;
	let modelMatrix = ear.math.identity4x4;
	let pressVector; // this is the location of the onPress. used in onMove.
	let pressViewMatrix; // onPress. used in onMove.
	let touchPoint = [0, 0, 0]; // mouse pointer. used as input for shader

	const drawShader = (gl, shader, uniforms) => {
		gl.useProgram(shader.program);
		// gl.enable(gl.DEPTH_TEST);
		// set uniforms
		const uniformCount = gl.getProgramParameter(shader.program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < uniformCount; i += 1) {
			const uniformName = gl.getActiveUniform(shader.program, i).name;
			const uniform = uniforms[uniformName];
			if (uniform) {
				uniform.set(gl.getUniformLocation(shader.program, uniformName), uniform.value);
			}
		}
		// set vertex arrays
		shader.vertexArrays.forEach(el => {
			gl.bindBuffer(gl.ARRAY_BUFFER, el.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, el.data, gl.STATIC_DRAW);
			gl.vertexAttribPointer(el.location, el.length, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(el.location);
		});
		// gl.linkProgram(shader.program);
		// draw elements
		shader.elementArrays.forEach(el => {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, el.buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, el.data, gl.STATIC_DRAW);
			gl.drawElements(
				el.mode, // GL.TRIANGLES for example
				el.data.length,
				gl.UNSIGNED_SHORT,
				el.buffer
			);
		});
		// gl.disable(gl.DEPTH_TEST);
	};

	const makeUniforms = () => ({
		matrix: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: ear.math.multiplyMatrices4(ear.math
				.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix),
			// value: ear.math.multiplyMatrices4(projectionMatrix, viewMatrix),
		},
		inverseMatrix: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: ear.math.invertMatrix4(ear.math
				.multiplyMatrices4(ear.math
					.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix)),
			// value: ear.math.invertMatrix4(ear.math.multiplyMatrices4(projectionMatrix, viewMatrix)),
		},
		projectionMatrix: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: projectionMatrix,
		},
		modelViewMatrix: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: ear.math.multiplyMatrices4(viewMatrix, modelMatrix),
		},
		thickness: {
			set: (i, value) => gl.uniform1f(i, value),
			value: strokeWidth / 2,
		},
		touchPoint: {
			set: (i, value) => gl.uniform3fv(i, value),
			value: touchPoint,
		},
		u_resolution: {
			set: (i, value) => gl.uniform2fv(i, value),
			value: [canvas.clientWidth, canvas.clientHeight],
		},
		u_pixelRatio: {
			set: (i, value) => gl.uniform1f(i, value),
			value: window.devicePixelRatio,
		},
	});

	const draw = () => {
		// console.log("draw", gl != null);
		if (!gl) { return; }
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		const uniforms = makeUniforms(gl);
		shaders.forEach(shader => drawShader(gl, shader, uniforms));
	};

	const makeProjectionMatrix = () => {
		// console.log("rebuildProjection", canvas != null);
		if (!canvas) { return ear.math.identity4x4; }
		const Z_NEAR = 0.01;
		const Z_FAR = 25;
		const ORTHO_FAR = -10;
		const ORTHO_NEAR = 10;
		const canvasDimensions = [canvas.clientWidth, canvas.clientHeight];
		const vmin = Math.min(...canvasDimensions);
		const padding = [0, 1].map(i => ((canvasDimensions[i] - vmin) / vmin) / 2);
		const sides = padding.map(p => p + 0.5);
		// console.log("ortho", sides[1], sides[0], -sides[1], -sides[0]);
		return perspective === "orthographic"
			? ear.math.makeOrthographicMatrix4(sides[1], sides[0], -sides[1], -sides[0], ORTHO_FAR, ORTHO_NEAR)
			: ear.math.makePerspectiveMatrix4(fov * Math.PI / 180, canvasDimensions[0] / canvasDimensions[1], Z_NEAR, Z_FAR);
	};

	const makeViewMatrix = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 1];
	// const makeViewMatrix = () => ear.math.invertMatrix4(ear.math.makeLookAtMatrix4([0, 0, 1], [0, 0, 0], [0, 1, 1]));
	/**
	 * @description build an aspect-fit model matrix (possibly an inverse-model matrix)
	 * which brings the vertices inside of a 2x2x2 origin-centered bounding box.
	 */
	const makeModelMatrix = () => {
		// console.log("makeModelMatrix", origami != null);
		if (!origami) { return ear.math.identity4x4; }
		const bounds = ear.graph.getBoundingBox(origami);
		if (!bounds) { return ear.math.identity4x4; }
		const scale = Math.max(...bounds.span); // * Math.SQRT2;
		const center = ear.math.resize(3, ear.math.midpoint(bounds.min, bounds.max));
		const scalePositionMatrix = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, ...center, 1];
		return ear.math.invertMatrix4(scalePositionMatrix);
	};

	const rebuildShaders = (graph) => {
		// console.log("rebuildShaders", gl != null);
		if (!gl) { return; }
		deallocShaders();
		shaders = [];
		switch(viewClass) {
			case "creasePattern":
				shaders.push(...CreasePattern(graph, gl, version));
				break;
			case "foldedForm":
				shaders.push(...FoldedForm(graph, gl, version));
				break;
			default: break;
		}
		shaders.push(...TouchIndicators(gl, version));
	};

	const deallocShaders = () => {
		shaders.forEach(shader => {
			shader.vertexArrays.forEach(vert => gl.disableVertexAttribArray(vert.location));
			shader.vertexArrays.forEach(vert => gl.deleteBuffer(vert.buffer));
			shader.elementArrays.forEach(elements => gl.deleteBuffer(elements.buffer));
		});
		shaders.forEach(shader => gl.deleteProgram(shader.program));
		while (shaders.length) { shaders.pop(); }
		// gl.deleteTexture(someTexture);
		// gl.deleteRenderbuffer(someRenderbuffer);
		// gl.deleteFramebuffer(someFramebuffer);
	};

	const rebuildAllAndDraw = () => {
		// console.log("rebuildAllAndDraw");
		rebuildShaders(origami);
		projectionMatrix = makeProjectionMatrix();
		viewMatrix = makeViewMatrix();
		modelMatrix = makeModelMatrix();
		draw();
	};

	const rebuildProjectionAndDraw = () => {
		// console.log("rebuildProjectionAndDraw");
		projectionMatrix = makeProjectionMatrix();
		draw();
	};

	$: rebuildProjectionAndDraw(innerWidth, innerHeight, fov);
	$: rebuildAllAndDraw(origami, viewClass, perspective);
	$: draw(strokeWidth);

	onMount(() => {
		// console.log("onMount")
		canvas = document.querySelector("canvas");
		const init = ear.webgl.initialize(canvas, 1);
		gl = init.gl;
		version = init.version;
		if (!gl) { return; }
		canvas.addEventListener("mousedown", onPress, false);
		canvas.addEventListener("mousemove", onMove, false);
		canvas.addEventListener("mouseup", onRelease, false);
		canvas.addEventListener("wheel", onScroll, false);
		canvas.addEventListener("ontouchstart", onPress, false);
		canvas.addEventListener("ontouchmove", onMove, false);
		canvas.addEventListener("ontouchend", onRelease, false);
		// optional open gl settings

		// gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		rebuildAllAndDraw();
		// const animate = () => {
		// 	animationID = window.requestAnimationFrame(animate);
		// 	draw();
		// };
		// animate();
	});

	onDestroy(() => {
		canvas = null;
		// dealloc webgl
		deallocShaders();
		// gl.getExtension('WEBGL_lose_context').loseContext();
		// window.cancelAnimationFrame(animationID);
	});
	/**
	 * matrix is attitude matrix, not projection matrix
	 */
	const vectorFromScreenLocation = (point, canvasSize) => {
		// const matrix = ear.math
		// 	.multiplyMatrices4(ear.math
		// 		.multiplyMatrices4(projectionMatrix, pressViewMatrix), modelMatrix);
		const matrix = ear.math
			.multiplyMatrices4(projectionMatrix, pressViewMatrix);
		const inverse = ear.math.invertMatrix4(matrix);
		// const inverse = ear.math.invertMatrix4(projectionMatrix);
		const scaled = [0, 1].map(i => point[i] / canvasSize[i])
		const screen = [
			2.0 * (0.5 - scaled[0]),
			2.0 * (scaled[1] - 0.5),
			// 0.05, // this controls the speed of the spin
			1.0, // this controls the speed of the spin
			0.0,
		];
		// const scaleScreen = [dragSpeed * screen[0], dragSpeed * screen[1], screen[2], screen[3]];
		const vec = ear.math.multiplyMatrix4Vector3(inverse, screen);
		return vec;
		// return ear.math.normalize3(vec);
	};
	const vectorFromScreenLocation2 = (point, canvasSize) => {
		const matrix = ear.math
			.multiplyMatrices4(ear.math
				.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix);
		// const matrix = ear.math.multiplyMatrices4(projectionMatrix, viewMatrix);
		const inverse = ear.math.invertMatrix4(matrix);
		// const inverse = ear.math.invertMatrix4(projectionMatrix);
		const scaled = [0, 1].map(i => point[i] / canvasSize[i])
		const screen = [
			2.0 * (0.5 - scaled[0]),
			2.0 * (scaled[1] - 0.5),
			// 0.05, // this controls the speed of the spin
			1.0, // this controls the speed of the spin
			0.0,
		];
		// const scaleScreen = [dragSpeed * screen[0], dragSpeed * screen[1], screen[2], screen[3]];
		const vec = ear.math.multiplyMatrix4Vector3(inverse, screen);
		return vec;
		// return ear.math.normalize3(vec);
	};

	const onPress = (e) => {
		pressViewMatrix = [...viewMatrix];
		pressVector = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
		);
		// console.log("press", pressVector);
	};

	const onMove = (e) => {
		touchPoint = [e.offsetX, e.offsetY, 0];
		// touchPoint = [e.offsetX / canvas.clientWidth, e.offsetY / canvas.clientHeight];
		// const m = ear.math.multiplyMatrices4(ear.math
		// 		.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix);
		// touchPoint = ear.math.multiplyMatrix4Vector3(ear.math.invertMatrix4(m), [e.offsetX, e.offsetY, 0, 1]);
		// touchPoint = [touchPoint[0], touchPoint[1]];
		if (!pressVector) { 
			// touchPoint = vectorFromScreenLocation2(
			// 	[e.offsetX, e.offsetY],
			// 	[canvas.clientWidth, canvas.clientHeight],
			// );
			// console.log("HERE", ear.math.multiplyMatrix4Vector3(ear.math.invertMatrix4(m), touchPoint));
			// console.log("MM", modelMatrix);
			draw();
			return;
		}
		const nowVector = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
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
		draw();
	};

	const onScroll = (e) => {
		const scrollSensitivity = 1 / 100;
		switch (perspective) {
			case "perspective": {
				const delta = -e.deltaY * scrollSensitivity;
				if (Math.abs(delta) < 1e-3) { return false; }
				const translateMatrix = ear.math.makeMatrix4Translate(0, 0, delta);
				viewMatrix = ear.math.multiplyMatrices4(translateMatrix, viewMatrix);
			} break;
			case "orthographic": {
				const delta = -e.deltaY * scrollSensitivity;
				if (Math.abs(delta) < 1e-3) { return false; }
				const scale = 1 + delta;
				const scaleMatrix = ear.math.makeMatrix4Scale([scale, scale, scale]);
				viewMatrix = ear.math.multiplyMatrices4(scaleMatrix, viewMatrix);
			} break;
		}
		draw();
		return false;
	};

	const onRelease = () => { pressVector = undefined; };

</script>

<svelte:window 
	bind:innerWidth
	bind:innerHeight
/>

<canvas></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
