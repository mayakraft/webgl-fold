import ear from "rabbit-ear";
import styles from './App.module.css';
import { createSignal, createEffect, onMount } from "solid-js";
import Settings from "./Settings";
import WebGLView from "./WebGLView";
import { averageEdgeLength } from "../../src/graph/general";
import craneCP from "../../fold/crane-cp.fold?raw";

function App() {
  // the origami
  const [FOLD, setFOLD] = createSignal({});
  const [frames, setFrames] = createSignal([{}]);
  const [selectedFrame, setSelectedFrame] = createSignal(0);
  // const [origami, setOrigami] = createSignal({});
  // view options
  const [perspective, setPerspective] = createSignal("orthographic");
  const [viewClass, setViewClass] = createSignal("creasePattern");
  const [strokeWidth, setStrokeWidth] = createSignal(0.0025);
  const [opacity, setOpacity] = createSignal(1.0);
  const [fov, setFov] = createSignal(30);
  const [flipCameraZ, setFlipCameraZ] = createSignal(false);
  const [frontColor, setFrontColor] = createSignal("#57f");
  const [backColor, setBackColor] = createSignal("#fff");
  const [showFoldedFaces, setShowFoldedFaces] = createSignal(true);
  const [showFoldedFaceOutlines, setShowFoldedFaceOutlines] = createSignal(true);
  const [showFoldedCreases, setShowFoldedCreases] = createSignal(false);
  const [layerNudge, setLayerNudge] = createSignal(1e-5);
  const [strokeWidthSlider, setStrokeWidthSlider] = createSignal(5);
  const [layerNudgeSlider, setLayerNudgeSlider] = createSignal(6);
  const [selectedExample, setSelectedExample] = createSignal();

  // set the view settings (crease pattern / folded, etc...)
  // depending on if the FOLD object contains frame_classes.
  const updateViewSettings = (origami) => {
    if (!origami) { return; }
    // infer view style if frame_classes exists
    if (origami.frame_classes) {
      if (origami.frame_classes.includes("creasePattern")) {
        setPerspective("orthographic");
        setViewClass("creasePattern");
      } else if (origami.frame_classes.includes("foldedForm")) {
        setPerspective("perspective");
        setViewClass("foldedForm");
      }
    }
    // find a decent stroke width
    // (do this even if we cannot infer creasePattern from frame_classes)
    const avgEdgeLen = averageEdgeLength(origami);
    // invert this: Math.pow(2, strokeWidthSlider) / 100000;
    setStrokeWidthSlider(!avgEdgeLen
      ? 0.1
      : Math.log2((avgEdgeLen * 0.02) * 100000));
    // find a decent spacing between layers (layerNudge)
    const bounds = ear.graph.getBoundingBox(origami);
    if (bounds && bounds.span) {
      const maxSpan = Math.max(...bounds.span);
      // layerNudgeSlider = Math.log2((maxSpan * 0.001) * 100000);
      setLayerNudgeSlider(Math.log2((maxSpan * 0.0005) * 100000));
    }
  };

  const loadFOLD = (result) => {
    setFOLD(result);
    setSelectedFrame(0);
  };

  const getFileFrames = (foldFile) => {
    return !foldFile.file_frames
      ? [ear.graph.flattenFrame(foldFile, 0)]
      : Array.from(Array(foldFile.file_frames.length + 1))
        .map((_, i) => ear.graph.flattenFrame(foldFile, i));
  };

  createEffect(() => setFrames(getFileFrames(FOLD())));

  createEffect(() => updateViewSettings(frames()[selectedFrame()]));

  createEffect(() => setStrokeWidth(Math.pow(2, strokeWidthSlider()) / 100000));

  createEffect(() => setLayerNudge(Math.pow(2, layerNudgeSlider()) / 1000000));

  return (
    <div class={styles.App}>
      <WebGLView
        origami={frames()[selectedFrame()]}
        viewClass={viewClass}
        perspective={perspective}
        strokeWidth={strokeWidth}
        opacity={opacity}
        fov={fov}
        flipCameraZ={flipCameraZ}
        frontColor={frontColor}
        backColor={backColor}
        showFoldedCreases={showFoldedCreases}
        showFoldedFaces={showFoldedFaces}
        showFoldedFaceOutlines={showFoldedFaceOutlines}
        layerNudge={layerNudge}
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
        flipCameraZ={flipCameraZ}
        setFlipCameraZ={setFlipCameraZ}
        frontColor={frontColor}
        setFrontColor={setFrontColor}
        backColor={backColor}
        setBackColor={setBackColor}
        showFoldedCreases={showFoldedCreases}
        setShowFoldedCreases={setShowFoldedCreases}
        showFoldedFaces={showFoldedFaces}
        setShowFoldedFaces={setShowFoldedFaces}
        showFoldedFaceOutlines={showFoldedFaceOutlines}
        setShowFoldedFaceOutlines={setShowFoldedFaceOutlines}
        layerNudge={layerNudge}
        setLayerNudge={setLayerNudge}
        strokeWidthSlider={strokeWidthSlider}
        setStrokeWidthSlider={setStrokeWidthSlider}
        layerNudgeSlider={layerNudgeSlider}
        setLayerNudgeSlider={setLayerNudgeSlider}

        loadFOLD={loadFOLD}
        origami={frames()[selectedFrame()]}
        FOLD={FOLD}
        frames={frames}
        selectedFrame={selectedFrame}
        setSelectedFrame={setSelectedFrame}
        selectedExample={selectedExample}
        setSelectedExample={setSelectedExample}
      />
    </div>
  );
}

export default App;
