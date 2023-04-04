import { writable } from "svelte/store";

// darkmode or lightmode
export const colorMode = writable("light");

// the camera's perspective: "orthographic" or "perspective"
export const perspective = writable("orthographic");

// the camera's field of view
export const fov = writable(30.25);

// flip the camera around so that we are
// looking at the model from directly behind
export const flipCameraZ = writable(false);

// the rendering style: "foldedForm" or "creasePattern"
export const viewClass = writable("creasePattern");

// stroke width of the crease edges
export const strokeWidth = writable(0.0025);

// opacity of the 3D model
export const opacity = writable(1.0);

// the colors of the faces of the 3D model ("foldedForm")
export const frontColor = writable("#57f");
export const backColor = writable("#fff");

// show/hide things
export const showFoldedCreases = writable(false);
export const showFoldedFaces = writable(true);
export const showFoldedFaceOutlines = writable(true);

// if a 3D model comes with faceOrders, this is
// the amount of space between overlapping faces
export const layerNudge = writable(1e-6);
