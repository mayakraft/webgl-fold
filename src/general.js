export const makeViewMatrixFront = () => [
	1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1.85, 1,
];

export const makeViewMatrixBack = () => [
	-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -1.85, 1,
];

// const makeViewMatrix = () => ear.math.invertMatrix4(ear.math.makeLookAtMatrix4([0, 0, 1], [0, 0, 0], [0, 1, 1]));
