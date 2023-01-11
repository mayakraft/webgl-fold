import ear from "rabbit-ear";
import styles from "./FileInfo.module.css";

const findNonSpecKeys = (fold) => {
	if (!fold) { return []; }
	const map = {};
	ear.graph.foldKeys.forEach(key => { map[key] = true; });
	return Object.keys(fold).filter(key => !map[key]);
};

const FileInfo = (props) => {
	const frame = props.frames()[props.selectedFrame()];
	const nonSpecKeys = findNonSpecKeys(props.frames()[props.selectedFrame()]);
	return (
		<div class={styles.FileInfo}>

			<p class={styles.Info}>vertices: <span class={styles.Value}>{ear.graph.count.vertices(props.FOLD())}</span>, edges: <span class={styles.Value}>{ear.graph.count.edges(props.FOLD())}</span>, faces: <span class={styles.Value}>{ear.graph.count.faces(props.FOLD())}</span></p>

			<Show when={props.FOLD().file_spec}>
				<p class={styles.Info}>FOLD spec: <span class={styles.Value}>{props.FOLD().file_spec}</span></p>
			</Show>

			<Show when={props.FOLD().file_title}>
				<p class={styles.Info}>file title: <span class={styles.Value}>{props.FOLD().file_title}</span></p>
			</Show>

			<Show when={props.FOLD().file_author}>
				<p class={styles.Info}>file author: <span class={styles.Value}>{props.FOLD().file_author}</span></p>
			</Show>

			<Show when={props.FOLD().file_creator}>
				<p class={styles.Info}>file creator: <span class={styles.Value}>{props.FOLD().file_creator}</span></p>
			</Show>

			<Show when={props.FOLD().file_description}>
				<p class={styles.Info}>file description: <span class={styles.Value}>{props.FOLD().file_description}</span></p>
			</Show>

	    <Show when={props.FOLD().file_classes}>
				<p class={styles.Info}>
					file classes:
					<For each={props.FOLD().file_classes}>{str =>
						<span class={styles.Pill}>{str}</span>
					}</For>
				</p>
			</Show>

			<Show when={frame.frame_title}>
				<p class={styles.Info}>frame title: <span class={styles.Value}>{frame.frame_title}</span></p>
			</Show>

			<Show when={frame.frame_author}>
				<p class={styles.Info}>frame author: <span class={styles.Value}>{frame.frame_author}</span></p>
			</Show>

			<Show when={frame.frame_description}>
				<p class={styles.Info}>frame description: <span class={styles.Value}>{frame.frame_description}</span></p>
			</Show>

			<Show when={frame.frame_unit}>
				<p class={styles.Info}>frame unit: <span class={styles.Value}>{frame.frame_unit}</span></p>
			</Show>

			<Show when={frame.frame_classes}>
				<p class={styles.Info}>
					frame classes:
					<For each={frame.frame_classes}>{str =>
						<span class={styles.Pill}>{str}</span>
					}</For>
				</p>
			</Show>

			<Show when={frame.frame_attributes}>
				<p class={styles.Info}>
					frame attributes:
					<For each={frame.frame_attributes}>{str =>
						<span class={styles.Pill}>{str}</span>
					}</For>
				</p>
			</Show>

			<Show when={nonSpecKeys.length}>
				<p class={styles.Info}>
					non-spec keys:
					<For each={nonSpecKeys}>{str =>
						<span class={[styles.Pill, styles.Warning].join(" ")}>{str}</span>
					}</For>
				</p>
			</Show>

		</div>
	);
};

export default FileInfo;
