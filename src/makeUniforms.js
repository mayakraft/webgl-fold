import ear from "rabbit-ear";

const hexColorToRGB = (value) => {
	const numbersOnly = value.replace(/#(?=\S)/g, '');
	const hexString = numbersOnly.length === 3
		? [0, 0, 1, 1, 2, 2].map(i => numbersOnly[i]).join("")
		: numbersOnly;
	const c = parseInt(hexString, 16);
	return [(c >> 16) & 255, (c >> 8) & 255, c & 255]
		.map(n => n / 255);
};

const makeUniforms = (gl, { projectionMatrix, viewMatrix, modelMatrix,
	strokeWidth, opacity, touchPoint, canvas, frontColor, backColor,
	projectedTouch }) => ({
	u_matrix: {
		func: "uniformMatrix4fv",
		value: ear.math.multiplyMatrices4(ear.math
			.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix),
	},
	u_inverseMatrix: {
		func: "uniformMatrix4fv",
		value: ear.math.invertMatrix4(ear.math
			.multiplyMatrices4(ear.math
				.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix)),
	},
	u_projection: {
		func: "uniformMatrix4fv",
		value: projectionMatrix,
	},
	u_view: {
		func: "uniformMatrix4fv",
		value: viewMatrix,
	},
	u_modelView: {
		func: "uniformMatrix4fv",
		value: ear.math.multiplyMatrices4(viewMatrix, modelMatrix),
	},
	u_strokeWidth: {
		func: "uniform1f",
		value: strokeWidth / 2,
	},
	u_opacity: {
		func: "uniform1f",
		value: opacity,
	},
	u_touch: {
		func: "uniform2fv",
		value: touchPoint,
	},
	u_resolution: {
		func: "uniform2fv",
		value: [canvas.clientWidth, canvas.clientHeight]
			.map(n => n * window.devicePixelRatio || 1),
	},
	u_frontColor: {
		func: "uniform3fv",
		value: hexColorToRGB(frontColor),
	},
	u_backColor: {
		func: "uniform3fv",
		value: hexColorToRGB(backColor),
	},
	u_projectedTouch: {
		func: "uniform3fv",
		value: projectedTouch,
	},
});

export default makeUniforms;
