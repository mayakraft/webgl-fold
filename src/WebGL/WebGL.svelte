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
	export let opacity = 1.0;
	let dragSpeed = 3.0;
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
	let touchPoint = [0, 0]; // mouse pointer. used as input for shader
	let projectedTouch = [0, 0, 0]; // todo: get rid of this

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
		u_matrix: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: ear.math.multiplyMatrices4(ear.math
				.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix),
		},
		u_inverseMatrix: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: ear.math.invertMatrix4(ear.math
				.multiplyMatrices4(ear.math
					.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix)),
		},
		u_projection: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: projectionMatrix,
		},
		u_view: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: viewMatrix,
		},
		u_modelView: {
			set: (i, value) => gl.uniformMatrix4fv(i, false, value),
			value: ear.math.multiplyMatrices4(viewMatrix, modelMatrix),
		},
		u_strokeWidth: {
			set: (i, value) => gl.uniform1f(i, value),
			value: strokeWidth / 2,
		},
		u_opacity: {
			set: (i, value) => gl.uniform1f(i, value),
			value: opacity,
		},
		u_touch: {
			set: (i, value) => gl.uniform2fv(i, value),
			value: touchPoint,
		},
		u_resolution: {
			set: (i, value) => gl.uniform2fv(i, value),
			value: [canvas.clientWidth, canvas.clientHeight]
				.map(n => n * window.devicePixelRatio || 1),
		},
		u_projectedTouch: {
			set: (i, value) => gl.uniform3fv(i, value),
			value: projectedTouch,
		},
	});

	const draw = () => {
		if (!gl) { return; }
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		const uniforms = makeUniforms(gl);
		shaders.forEach(shader => drawShader(gl, shader, uniforms));
	};

	const makeProjectionMatrix = () => {
		if (!canvas) { return ear.math.identity4x4; }
		const Z_NEAR = 0.01;
		const Z_FAR = 25;
		const ORTHO_FAR = -100;
		const ORTHO_NEAR = 100;
		const canvasDimensions = [canvas.clientWidth, canvas.clientHeight];
		const vmin = Math.min(...canvasDimensions);
		const padding = [0, 1].map(i => ((canvasDimensions[i] - vmin) / vmin) / 2);
		const sides = padding.map(p => p + 0.5);
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
		if (!origami) { return ear.math.identity4x4; }
		const bounds = ear.graph.getBoundingBox(origami);
		if (!bounds) { return ear.math.identity4x4; }
		const scale = Math.max(...bounds.span); // * Math.SQRT2;
		const center = ear.math.resize(3, ear.math.midpoint(bounds.min, bounds.max));
		const scalePositionMatrix = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, ...center, 1];
		return ear.math.invertMatrix4(scalePositionMatrix);
	};

	const rebuildViewport = () => {
		if (!gl) { return; }
		const devicePixelRatio = window.devicePixelRatio || 1;
		const size = [canvas.clientWidth, canvas.clientHeight]
			.map(n => n * devicePixelRatio);
		if (canvas.width !== size[0] || canvas.height !== size[1]) {
			canvas.width = size[0];
			canvas.height = size[1];
		}
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	};

	const rebuildShaders = (graph) => {
		if (!gl) { return; }
		deallocShaders();
		shaders = [];
		switch(viewClass) {
			case "creasePattern":
				shaders.push(...CreasePattern(gl, version, graph));
				break;
			case "foldedForm":
				shaders.push(...FoldedForm(gl, version, graph));
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
		rebuildViewport();
		rebuildShaders(origami);
		projectionMatrix = makeProjectionMatrix();
		viewMatrix = makeViewMatrix();
		modelMatrix = makeModelMatrix();
		draw();
	};

	const rebuildProjectionAndDraw = () => {
		rebuildViewport();
		projectionMatrix = makeProjectionMatrix();
		draw();
	};

	$: rebuildProjectionAndDraw(innerWidth, innerHeight, fov);
	$: rebuildAllAndDraw(origami, viewClass, perspective);
	$: draw(strokeWidth, opacity);

	onMount(() => {
		canvas = document.querySelector("canvas");
		if (!canvas) { throw new Error("canvas not found"); }
		canvas.addEventListener("mousedown", onPress, false);
		canvas.addEventListener("mousemove", onMove, false);
		canvas.addEventListener("mouseup", onRelease, false);
		canvas.addEventListener("wheel", onScroll, false);
		canvas.addEventListener("ontouchstart", onPress, false);
		canvas.addEventListener("ontouchmove", onMove, false);
		canvas.addEventListener("ontouchend", onRelease, false);
		// optional open gl settings

		// const init = ear.webgl.initialize(canvas, 1); // WebGL version 1
		const init = ear.webgl.initialize(canvas, 2); // WebGL version 2
		gl = init.gl;
		version = init.version;
		if (!gl) { throw new Error("WebGL could not initialize"); }

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		// gl.enable(gl.DEPTH_TEST);

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
		pressViewMatrix = [...viewMatrix];
		pressVector = vectorFromScreenLocation(
			[e.offsetX, e.offsetY],
			[canvas.clientWidth, canvas.clientHeight],
			pressViewMatrix,
			perspective === "perspective" ? dragSpeed : 1,
		);
	};

	const onMove = (e) => {
		const devicePixelRatio = window.devicePixelRatio || 1;
		// console.log("projectedTouch", projectedTouch);
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

<canvas></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
