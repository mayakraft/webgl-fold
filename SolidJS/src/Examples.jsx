import { onMount, createEffect } from "solid-js";

// example FOLD files
import craneCP from "../../fold/crane-cp.fold?raw";
import craneFolded from "../../fold/crane-folded.fold?raw";
import moosers3d from "../../fold/moosers-train.fold?raw";
import blintzFrames from "../../fold/blintz-frames.fold?raw";
import kabuto from "../../fold/kabuto.fold?raw";
import polygami from "../../fold/polygami.fold?raw";
import kraftBird from "../../fold/kraft-bird-base-06-mvf.fold?raw";

const exampleData = {
	craneCP, craneFolded, moosers3d,
	blintzFrames, kabuto, polygami, kraftBird,
};

const examples = [
	{ text: "crease pattern: crane", data: "craneCP" },
	{ text: "crease pattern: bird", data: "kraftBird" },
	{ text: "folded: crane", data: "craneFolded" },
	{ text: "folded: Mooser's train", data: "moosers3d" },
	{ text: "folded: polygami", data: "polygami" },
	{ text: "frames: kabuto", data: "kabuto" },
	{ text: "frames: blintz base", data: "blintzFrames" },
];

// load example on start
// onMount(() => selectedExample = "craneCP");

const Examples = (props) => {

	createEffect(() => props.selectedExample() == null
		? (() => {})()
		: props.loadFOLD(JSON.parse(exampleData[props.selectedExample()])))

	return (<>
		<h3>example:</h3>
    <select
    	value={props.selectedExample()}
    	onInput={e => props.setSelectedExample(e.currentTarget.value)}>
			<For each={examples}>{example =>
				<option value={example.data}>
					{example.text}
				</option>
			}</For>
	</select>
	</>);
};

export default Examples;
