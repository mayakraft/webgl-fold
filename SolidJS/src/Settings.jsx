import ear from "rabbit-ear";
import { createSignal } from "solid-js";
import styles from "./Settings.module.css";
import FileInfo from "./FileInfo";
import Examples from "./Examples";

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

      <h3>load FOLD</h3>
      <input type="file" onInput={fileDialogOnInput} />

      <hr />

      <Examples
        loadFOLD={props.loadFOLD}
        selectedExample={props.selectedExample}
        setSelectedExample={props.setSelectedExample}
      />

      <hr />

      <h3>file info</h3>

      <Show when={props.frames().length > 1}>
        <p>
          frame: <span class="value">{props.selectedFrame()+1}/{props.frames().length}</span>
        </p>
        <div>
          <input
            type="range"
            min="0"
            max={props.frames().length - 1}
            step="1"
            value={props.selectedFrame()}
            onInput={e => props.setSelectedFrame(e.target.value)} />
        </div>
      </Show>

      <FileInfo
        FOLD={props.FOLD}
        frames={props.frames}
        selectedFrame={props.selectedFrame}
      />

      <hr />

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
          class={styles.ShortInput}
          type="text"
          placeholder="field of view"
          value={props.fov()}
          onInput={(e) => props.setFov(e.target.value)}
        />
        <br/>
      </Show>

      <span>flip over</span>
      <input
        type="checkbox"
        checked={props.flipCameraZ()}
        onClick={() => props.setFlipCameraZ(!props.flipCameraZ())}
      />

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
        <br />
        <span>front</span><input
          type="text"
          class={styles.ShortInput}
          value={props.frontColor()}
          onInput={(e) => props.setFrontColor(e.target.value)}
        />
        <span>back</span><input
          type="text"
          class={styles.ShortInput}
          value={props.backColor()}
          onInput={(e) => props.setBackColor(e.target.value)}
        />
      </Show>

      <Show when={props.viewClass() === "foldedForm"}>
        <br/>
        <span>show faces</span>
        <input
          type="checkbox"
          checked={props.showFoldedFaces()}
          onClick={() => props.setShowFoldedFaces(!props.showFoldedFaces())}
        />
        <br/>
        <span>face outlines</span>
        <input
          type="checkbox"
          checked={props.showFoldedFaceOutlines()}
          onClick={() => props.setShowFoldedFaceOutlines(!props.showFoldedFaceOutlines())}
          disabled={!props.showFoldedFaces()}
        />
        <br/>
        <span>show creases</span>
        <input
          type="checkbox"
          checked={props.showFoldedCreases()}
          onClick={() => props.setShowFoldedCreases(!props.showFoldedCreases())}
        />
        <br/>
        <span>stroke width</span><input
          type="range"
          min="1"
          max="20"
          step="0.01"
          value={props.strokeWidthSlider()}
          onInput={e => props.setStrokeWidthSlider(e.target.value)}
          disabled={!props.showFoldedCreases()}
        />
        <br/>
      </Show>
      <Show when={props.viewClass() === "foldedForm" && props.origami !== undefined}>
        <Show when={props.origami.faceOrders || props.origami.faces_layer}>
          <hr />
          <h3>overlapping faces</h3>
          <span>explode layers</span><input
            type="range"
            min="1"
            max="20"
            step="0.01"
            value={props.layerNudgeSlider()}
            onInput={e => props.setLayerNudgeSlider(e.target.value)}
          />
          <br />
          <input
            type="text"
            class={styles.LongInput}
            value={props.layerNudge()}
            onInput={(e) => props.setLayerNudge(e.target.value)}
          />
        </Show>
      </Show>

    </div>
  );
}

export default Settings;
