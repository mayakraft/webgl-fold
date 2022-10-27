import ear from "rabbit-ear";
/**
 * 
 */
export const rebuildViewport = (gl, canvas) => {
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

/**
 * @param {object} params all parameters are enclosed in one object
 * - {object} canvas an HTML canvas
 * - {string} perspective "orthographic" or "perspective"
 */
export const makeProjectionMatrix = (canvas, perspective = "perspective", fov = 45) => {
	if (!canvas) { return ear.math.identity4x4; }
	const Z_NEAR = 0.1;
	const Z_FAR = 3;
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

export const makeViewMatrixFront = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1.85, 1];
export const makeViewMatrixBack = () => [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -1.85, 1];
// const makeViewMatrix = () => ear.math.invertMatrix4(ear.math.makeLookAtMatrix4([0, 0, 1], [0, 0, 0], [0, 1, 1]));
/**
 * @description build an aspect-fit model matrix (possibly an inverse-model matrix)
 * which brings the vertices inside of a 2x2x2 origin-centered bounding box.
 * @param {object} params all parameters are enclosed in one object
 * - {object} origami a FOLD graph
 */
export const makeModelMatrix = (origami) => {
	if (!origami) { return ear.math.identity4x4; }
	const bounds = ear.graph.getBoundingBox(origami);
	if (!bounds) { return ear.math.identity4x4; }
	const scale = Math.max(...bounds.span); // * Math.SQRT2;
	const center = ear.math.resize(3, ear.math.midpoint(bounds.min, bounds.max));
	const scalePositionMatrix = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, ...center, 1];
	return ear.math.invertMatrix4(scalePositionMatrix);
};
