import ear from "rabbit-ear";

const makeUniforms = (gl, { projectionMatrix, viewMatrix, modelMatrix,
	strokeWidth, opacity, touchPoint, canvas, projectedTouch }) => ({
	u_matrix: {
		setter: (i, value) => gl.uniformMatrix4fv(i, false, value),
		value: ear.math.multiplyMatrices4(ear.math
			.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix),
	},
	u_inverseMatrix: {
		setter: (i, value) => gl.uniformMatrix4fv(i, false, value),
		value: ear.math.invertMatrix4(ear.math
			.multiplyMatrices4(ear.math
				.multiplyMatrices4(projectionMatrix, viewMatrix), modelMatrix)),
	},
	u_projection: {
		setter: (i, value) => gl.uniformMatrix4fv(i, false, value),
		value: projectionMatrix,
	},
	u_view: {
		setter: (i, value) => gl.uniformMatrix4fv(i, false, value),
		value: viewMatrix,
	},
	u_modelView: {
		setter: (i, value) => gl.uniformMatrix4fv(i, false, value),
		value: ear.math.multiplyMatrices4(viewMatrix, modelMatrix),
	},
	u_strokeWidth: {
		setter: (i, value) => gl.uniform1f(i, value),
		value: strokeWidth / 2,
	},
	u_opacity: {
		setter: (i, value) => gl.uniform1f(i, value),
		value: opacity,
	},
	u_touch: {
		setter: (i, value) => gl.uniform2fv(i, value),
		value: touchPoint,
	},
	u_resolution: {
		setter: (i, value) => gl.uniform2fv(i, value),
		value: [canvas.clientWidth, canvas.clientHeight]
			.map(n => n * window.devicePixelRatio || 1),
	},
	u_projectedTouch: {
		setter: (i, value) => gl.uniform3fv(i, value),
		value: projectedTouch,
	},
});

export default makeUniforms;
