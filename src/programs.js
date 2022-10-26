/**
 * @param {object} gl a link to the WebGL instance
 * @param {number} version 1 or 2, which WebGL version.
 * @param {object} shader the result of calling CreasePattern() FoldedForm()...
 * @param {object} uniforms the result of calling makeUniforms()
 */
export const drawProgram = (gl, version, shader, uniforms = {}) => {
	gl.useProgram(shader.program);
	shader.flags.forEach(flag => gl.enable(flag));
	// set uniforms
	const uniformCount = gl.getProgramParameter(shader.program, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < uniformCount; i += 1) {
		const uniformName = gl.getActiveUniform(shader.program, i).name;
		const uniform = uniforms[uniformName];
		if (uniform) {
			uniform.setter(gl.getUniformLocation(shader.program, uniformName), uniform.value);
		}
	}
	// set vertex arrays
	shader.vertexArrays.forEach(el => {
		gl.bindBuffer(gl.ARRAY_BUFFER, el.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, el.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(el.location, el.length, el.type, false, 0, 0);
		gl.enableVertexAttribArray(el.location);
	});
	// gl.linkProgram(shader.program);
	// draw elements
	// WebGL 2 supports UNSIGNED_INT (Uint32Array)
	// WebGL 1 cannot and must use UNSIGNED_SHORT (Uint16Array)
	shader.elementArrays.forEach(el => {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, el.buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, el.data, gl.STATIC_DRAW);
		gl.drawElements(
			el.mode, // GL.TRIANGLES for example
			el.data.length,
			version === 2 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
			el.buffer
		);
	});
	shader.flags.forEach(flag => gl.disable(flag));
};
/**
 * 
 */
export const deallocProgram = (gl, shader) => {
	shader.vertexArrays.forEach(vert => gl.disableVertexAttribArray(vert.location));
	shader.vertexArrays.forEach(vert => gl.deleteBuffer(vert.buffer));
	shader.elementArrays.forEach(elements => gl.deleteBuffer(elements.buffer));
	gl.deleteProgram(shader.program);
	// gl.deleteTexture(someTexture);
	// gl.deleteRenderbuffer(someRenderbuffer);
	// gl.deleteFramebuffer(someFramebuffer);
};
