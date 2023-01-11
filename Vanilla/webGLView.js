const makeViewMatrixFront = () => [
	1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1.85, 1,
];
const makeViewMatrixBack = () => [
	-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -1.85, 1,
];

let origami = {};
let perspective = "orthographic";
let viewClass = "creasePattern";
let fov = 30;
let strokeWidth = 0.0025;
let layerNudge = 1e-4;
let opacity = 1.0;
let flipCameraZ = false;
let frontColor = "#57f";
let backColor = "#fff";

const dragSpeed = 3.0;
// Svelte will bind these. canvas to <canvas>
let canvas;
// WebGL things
let gl; // the WebGL instance
let version; // which WebGL version was initialized: 1 or 2
let programs = [];
// gl matrices
let projectionMatrix = ear.math.identity4x4;
let viewMatrix = ear.math.identity4x4;
let modelMatrix = ear.math.identity4x4;
// touch interaction
let pressVector; // this is the location of the onPress. used in onMove.
let pressViewMatrix; // onPress. used in onMove.
let touchPoint = [0, 0]; // mouse pointer. used as input for shader

const draw = () => {
	if (!gl) { return; }
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const uniforms = programs.map(prog => prog.makeUniforms(gl, {
		projectionMatrix, viewMatrix, modelMatrix,
		strokeWidth, opacity, touchPoint, canvas, frontColor, backColor,
	}));
	programs.forEach((program, i) => ear.webgl.drawProgram(gl, version, program, uniforms[i]));
};

const rebuildShaders = (graph) => {
	if (!gl) { return; }
	deallocPrograms();
	const options = {
		layerNudge,
		// outlines: false,
		// edges: true,
	};
	programs = [...ear.webgl[viewClass](gl, version, graph, options)];
};

const deallocPrograms = () => {
	programs.forEach(program => ear.webgl.deallocProgram(gl, program));
	while (programs.length) { programs.pop(); }
};

const rebuildAllAndDraw = () => {
	ear.webgl.rebuildViewport(gl, canvas);
	rebuildShaders(origami);
	projectionMatrix = ear.webgl.makeProjectionMatrix(canvas, perspective, fov);
	viewMatrix = flipCameraZ ? makeViewMatrixBack() : makeViewMatrixFront();
	modelMatrix = ear.webgl.makeModelMatrix(origami);
	draw();
};

const rebuildModelAndDraw = () => {
	rebuildShaders(origami);
	draw();
};

const rebuildProjectionAndDraw = () => {
	ear.webgl.rebuildViewport(gl, canvas);
	projectionMatrix = ear.webgl.makeProjectionMatrix(canvas, perspective, fov);
	draw();
};

window.addEventListener("load", (event) => {
	canvas = document.querySelector("canvas");
	canvas.addEventListener("mousedown", onPress, false);
	canvas.addEventListener("mousemove", onMove, false);
	canvas.addEventListener("mouseup", onRelease, false);
	canvas.addEventListener("wheel", onScroll, false);
	canvas.addEventListener("ontouchstart", onPress, false);
	canvas.addEventListener("ontouchmove", onMove, false);
	canvas.addEventListener("ontouchend", onRelease, false);
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
	// console.log(`using WebGL ${version}`);
});

window.addEventListener("resize", rebuildProjectionAndDraw);

/**
 * "matrix" is attitude matrix, not projection matrix
 * matrix A, matrix B
 */
const vectorFromScreenLocation = (point, canvasSize, M = viewMatrix, scale = 1) => {
	const matrix = ear.math.multiplyMatrices4(projectionMatrix, M);
	const inverse = ear.math.invertMatrix4(matrix);
	const scaled = [0, 1].map(i => point[i] / canvasSize[i]);
	const centerScreen = [-2,0,0,0,0,2,0,0,0,0,1,0,1,-1,0,1];
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
	draw();
	return false;
};

const onRelease = () => {
	pressVector = undefined;
	pressViewMatrix = undefined;
};
