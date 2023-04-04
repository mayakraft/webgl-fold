import objToFold from "rabbit-ear/convert/objToFold/index.js";
import opxToFold from "rabbit-ear/convert/opxToFold/index.js";
import svgToFold from "rabbit-ear/convert/svgToFold/index.js";
import { makeEdgesLength } from "rabbit-ear/graph/make.js";
import { boundingBox } from "rabbit-ear/graph/boundary.js";
import {
	xmlStringToElement,
	flattenDomTreeWithStyle,
} from "rabbit-ear/svg/general/dom.js";
import { parseColorToRgb } from "rabbit-ear/svg/colors/parseColor.js";
import { rgbToAssignment } from "rabbit-ear/fold/colors.js";
import { get, writable } from "svelte/store";
import { distance } from "rabbit-ear/math/algebra/vector.js";

// file_frames, the first element [0] is the top layer frame itself.
// even if file_frames does not exist, [0] will be filled.
export const frames = writable([]);

// we can only visualize one frame at a time.
// even if file_frames does not exist, this will be filled
export const frame = writable({});

// when frameIndex updates, set "frame" to be
// the currently selected index in "frames"
export const frameIndex = writable(0);

// the origami (FOLD object)
export const FOLD = writable({});

// if the file is modified by this program,
// offer to the user to be able to download it.
export const fileCanDownload = writable(false);

// the example dropdown. various places (drag-and-drop, Settings file dialog)
// will want to reset this when the user loads a local file.
export const selectedExample = writable("placeholder");
/**
 * @description when the user tries to upload a file, it goes here
 * @param {string} contents the contents of the file as a string
 * @param {FOLD} fold the final, parsed FOLD object
 * @param {string} name the name without the extension
 * @param {string} extension the file extension
 * @param {object} popup if a file conversion is necessary
 */ 
export const uploadData = writable({});
/**
 * "soft" modify a FOLD file. the same file is loaded but it's
 * slightly modified, so we still want to trigger a refresh on
 * all components, but we don't want the frameIndex to change
 */
export const modifyFrame = (object) => {
	if (!object) { return; }
	const cachedIndex = get(frameIndex);
	switch (get(frameIndex)) {
	case 0:
		FOLD.set({...get(FOLD), ...object });
		break;
	default:
		const fold = get(FOLD);
		fold.file_frames[get(frameIndex) - 1] = {
			...fold.file_frames[get(frameIndex) - 1],
			...object,
		};
		FOLD.set({ ...fold });
		break;
	}
	fileCanDownload.set(true);
	frameIndex.set(cachedIndex);
};

const shortestEdgeLength = (graph) => {
	const lengths = graph.edges_vertices
		.map(ev => ev.map(v => graph.vertices_coords[v]))
		.map(segment => distance(...segment));
	const minLen = lengths
		.reduce((a, b) => Math.min(a, b), Infinity);
	return minLen === Infinity ? undefined : minLen;
};

/**
 * @description Get the Nth percentile edge length of edges from a graph.
 * This is useful to get a sense for how thick the strokeWidth should be
 * to make a reasonable rendering.
 */
export const getNthPercentileEdgeLength = (
	{ vertices_coords, edges_vertices },
	n = 0.1,
) => {
	if (!vertices_coords || !edges_vertices) {
		return undefined;
	}
	const edges_length = makeEdgesLength({ vertices_coords, edges_vertices });
	const sortedLengths = edges_length
		.slice()
		.sort((a, b) => a - b);
	const index_tenth_percent = Math.max(
		0,
		Math.min(
			Math.floor(sortedLengths.length * n),
			sortedLengths.length - 1,
		),
	);
	return sortedLengths[index_tenth_percent];
};

const getFilenameParts = (contents, filename) => {
	const [_, extension] = filename.match(/[^\\]*\.(\w+)$/);
	const [__, name] = filename.match(/(.*)\.[^.]+$/);
	return { name, extension };
};

const makeAssignments = (segments) => {
	const edgesStroke = segments.map(el => el.stroke);
	const strokes = Array.from(new Set(edgesStroke))
		.filter(el => typeof el === "string");
	const assignments = {};
	strokes.forEach(stroke => {
		assignments[stroke] = rgbToAssignment(...parseColorToRgb(stroke))
	});
	return assignments;
};
/**
 * @param {string} contents the file contents as a string
 * @param {string} filename the name of the file hopefully with an extension
 * @param {object}
 */
export const tryLoadFile = (contents, filename, options) => (
	new Promise((resolve, reject) => {
		const { name, extension } = getFilenameParts(contents, filename);
		let fold, edgeGraph;
		switch (extension.toLowerCase()) {
		case "fold":
			fold = JSON.parse(contents);
			uploadData.set({ contents, name, extension, fold });
			FOLD.set(fold);
			frameIndex.set(0);
			fileCanDownload.set(false);
			break;
		case "obj":
			fold = objToFold(contents);
			uploadData.set({ contents, name, extension, fold });
			FOLD.set(fold);
			frameIndex.set(0);
			fileCanDownload.set(true);
			break;
		case "svg":
			const svg = xmlStringToElement(contents, "image/svg+xml");
			const segments = svgToFold.svgSegments(svg);
			edgeGraph = svgToFold.svgEdgeGraph(svg);
			uploadData.set({
				contents,
				name,
				extension,
				fold: undefined,
				edgeGraph,
				boundingBox: boundingBox(edgeGraph),
				svg,
				options: {
					epsilon: shortestEdgeLength(edgeGraph) / 24,
					// epsilon: getNthPercentileEdgeLength(edgeGraph, 0.05) * 0.1,
					boundary: true,
					assignments: makeAssignments(segments),
					yFlip: false,
				},
			});
			break;
		case "opx":
			edgeGraph = opxToFold.opxEdgeGraph(contents);
			uploadData.set({
				contents,
				name,
				extension,
				fold: undefined,
				edgeGraph,
				boundingBox: boundingBox(edgeGraph),
				options: {
					// epsilon: getNthPercentileEdgeLength(edgeGraph, 0.05) * 0.1,
					epsilon: shortestEdgeLength(edgeGraph) / 24,
					yFlip: false,
				},
			});
			break;
		default: break;
		}
		resolve();
	})
);

export const completeFileImport = () => {
	const data = get(uploadData);
	let fold;
		switch (data.extension.toLowerCase()) {
		case "svg": fold = svgToFold(data.contents, data.options); break; // options
		case "opx": fold = opxToFold(data.contents, data.options); break; // options
		default: break;
	}
	if (!fold) { return; }
	uploadData.set({ ...uploadData, fold });
	// console.log("completeFileImport options", data.options);
	// console.log("data", data);
	// console.log("fold", fold);
	// once the file is in a FOLD format, pass it in here
	FOLD.set(fold);
	frameIndex.set(0);
	fileCanDownload.set(true);
};
