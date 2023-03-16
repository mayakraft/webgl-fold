export const makeViewMatrixFront = () => [
	1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1.85, 1,
];
// from above
// export const makeViewMatrixFront = () => [
// 	1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, -1.85, 1,
// ];
// front
// export const makeViewMatrixFront = () => [
// 	0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, -1.85, 1,
// ];
export const makeViewMatrixBack = () => [
	-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -1.85, 1,
];

// const makeViewMatrix = () => invertMatrix4(makeLookAtMatrix4([0, 0, 1], [0, 0, 0], [0, 1, 1]));
