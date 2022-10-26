import ear from "rabbit-ear";

import { createSignal } from "solid-js";
import styles from "./Settings.module.css";

import craneCP from "../../fold/crane-cp.fold?raw";
import craneCP100 from "../../fold/crane-cp-100.fold?raw";
import craneFolded from "../../fold/crane-folded.fold?raw";
import bird3d from "../../fold/bird-3d.fold?raw";
import moosers3d from "../../fold/moosers-train-3d.fold?raw";

function Settings(props) {

  const fileDialogDidLoad = (string, filename, mimeType) => {
    try { props.loadFOLD(JSON.parse(string)); }
    catch (error) { window.alert(error); }
  };

  const fileDialogOnInput = (e) => {
    const file = e.target.files[0];
    let mimeType, filename;
    const reader = new FileReader();
    reader.onload = loadEvent => fileDialogDidLoad(loadEvent.target.result, filename, mimeType);
    if (e.target.files.length) {
      mimeType = e.target.files[0].type;
      filename = e.target.files[0].name;
      reader.readAsText(e.target.files[0]);
    }
  }

  return (
    <div class={styles.Settings}>

      <h3>viewport</h3>
      <input
        type="radio"
        name="radio-webgl-perspective"
        value="radio-webgl-perspective-orthographic"
        onClick={() => props.setPerspective("orthographic")}
        checked={props.perspective() === "orthographic"} />
      <label for="radio-webgl-perspective-orthographic">orthographic</label>
      <input
        type="radio"
        name="radio-webgl-perspective"
        value="radio-webgl-perspective-perspective"
        onClick={() => props.setPerspective("perspective")}
        checked={props.perspective() === "perspective"} />
      <label for="radio-webgl-perspective-perspective">perspective</label>
      <br />
      <Show when={props.perspective() === "perspective"}>
        <span>field of view:</span>
        <input
          type="text"
          placeholder="field of view"
          value={props.fov()}
          onInput={(e) => props.setFov(e.target.value)}
        />
        <br/>
      </Show>

      <hr />

      <h3>style</h3>
      <input
        type="radio"
        name="radio-view-class"
        value="radio-view-class-crease-pattern"
        onClick={() => props.setViewClass("creasePattern")}
        checked={props.viewClass()==="creasePattern"} />
      <label for="radio-view-class-crease-pattern">crease pattern</label>
      <input
        type="radio"
        name="radio-view-class"
        value="radio-view-class-folded-form"
        onClick={() => props.setViewClass("foldedForm")}
        checked={props.viewClass()==="foldedForm"} />
      <label for="radio-view-class-folded-form">folded form</label>
      <br />
      <Show when={props.viewClass() === "creasePattern"}>
        <span>stroke width</span>
        <input
          type="range"
          min="0.001"
          max="0.2"
          step="0.001"
          value={props.strokeWidth()}
          onInput={e => props.setStrokeWidth(e.target.value)} />
      </Show>
      <Show when={props.viewClass() === "foldedForm"}>
        <span>opacity</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={props.opacity()}
          onInput={e => props.setOpacity(e.target.value)} />
      </Show>

      <hr />

      <h3>current FOLD</h3>
      <p>V: <b>{ear.graph.count.vertices(props.origami())}</b>, E: <b>{ear.graph.count.edges(props.origami())}</b>, F: <b>{ear.graph.count.faces(props.origami())}</b></p>

      <hr />

      <h3>example:</h3>
      <button onClick={() => props.loadFOLD(JSON.parse(craneCP))}>cp: crane 1x1</button>
      <br />
      <button onClick={() => props.loadFOLD(JSON.parse(craneCP100))}>cp: crane 100x100</button>
      <br />
      <button onClick={() => props.loadFOLD(JSON.parse(craneFolded))}>folded: 2D crane</button>
      <br />
      <button onClick={() => props.loadFOLD(JSON.parse(bird3d))}>folded: 3D bird</button>
      <br />
      <button onClick={() => props.loadFOLD(JSON.parse(moosers3d))}>folded: 3D moser's train</button>

      <hr />

      <h3>load FOLD</h3>
      <input type="file" onInput={fileDialogOnInput} />

    </div>
  );
}

export default Settings;
