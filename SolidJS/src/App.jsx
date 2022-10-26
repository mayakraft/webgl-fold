import styles from './App.module.css';
import { createSignal, onMount } from "solid-js";

import Settings from "./Settings";
import WebGLView from "./WebGLView";

import craneCP from "../../fold/crane-cp.fold?raw";

function App() {
  // the origami
  const [origami, setOrigami] = createSignal({});
  // view options
  const [perspective, setPerspective] = createSignal("orthographic");
  const [viewClass, setViewClass] = createSignal("creasePattern");
  const [strokeWidth, setStrokeWidth] = createSignal(0.0025);
  const [opacity, setOpacity] = createSignal(1.0);
  const [fov, setFov] = createSignal(45);

  const loadFOLD = (result) => {
    setOrigami(result);
    // update view style according to file type
    if (origami().frame_classes) {
      if (origami().frame_classes.includes("creasePattern")) {
        setPerspective("orthographic");
        setViewClass("creasePattern");
      } else if (origami().frame_classes.includes("foldedForm")) {
        setPerspective("perspective");
        setViewClass("foldedForm");
      }
    }
  };

  // load example on start
  onMount(() => loadFOLD(JSON.parse(craneCP)));

  return (
    <div class={styles.App}>
      <WebGLView
        origami={origami}
        viewClass={viewClass}
        perspective={perspective}
        strokeWidth={strokeWidth}
        opacity={opacity}
        fov={fov}
      />
      <Settings
        perspective={perspective}
        setPerspective={setPerspective}
        viewClass={viewClass}
        setViewClass={setViewClass}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        opacity={opacity}
        setOpacity={setOpacity}
        fov={fov}
        setFov={setFov}
        loadFOLD={loadFOLD}
        origami={origami}
      />
    </div>
  );
}

export default App;
