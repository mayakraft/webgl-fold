import ear from "rabbit-ear";

const makeUniforms = (gl, { projectionMatrix, viewMatrix, modelMatrix,
	strokeWidth, opacity, touchPoint, canvas, projectedTouch }) => ({
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
	u_projectedTouch: {
		func: "uniform3fv",
		value: projectedTouch,
	},
});

export default makeUniforms;
