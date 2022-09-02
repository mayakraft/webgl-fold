import ear from "rabbit-ear";
import vertexShader from "./shaders/gl1-touches.vert?raw";
import fragmentShader from "./shaders/gl1-touches.frag?raw";

const makeVertexArrays = (gl, program) => [{
	location: gl.getAttribLocation(program, "position"),
	buffer: gl.createBuffer(),
	length: 2,
	data: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
}];

const makeElementArrays = (gl) => [{
	mode: gl.TRIANGLE_STRIP,
	buffer: gl.createBuffer(),
	data: new Uint16Array([0, 1, 2, 3]),
}];

const WebGLTouchIndicators = (gl, version = 1) => {
	const shaders = [];
	switch (version) {
		case 1: shaders.push(
				{ program: ear.webgl.createProgram(gl, vertexShader, fragmentShader) },
			); break;
		case 2: shaders.push(
				{ program: ear.webgl.createProgram(gl, vertexShader, fragmentShader) },
			); break;
	}
	shaders[0].vertexArrays = makeVertexArrays(gl, shaders[0].program);
	shaders[0].elementArrays = makeElementArrays(gl);
	return shaders;
};

export default WebGLTouchIndicators;
