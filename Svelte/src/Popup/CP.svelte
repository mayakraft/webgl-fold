<script lang="ts">
	import foldToSvg from "rabbit-ear/convert/foldToSvg/index.js";
	export let data;
	export let epsilon;
	export let showEpsilon;
	let svg;
	let layer;
	let rendering;

	$: {
		if (svg && layer && data && data.edgeGraph) {
			while (layer.children.length) {
				layer.removeChild(layer.children[0]);
			}
			rendering = foldToSvg.render(data.edgeGraph, layer);

			const bounds = data.boundingBox;
			// const viewBox = foldToSvg.getViewBox(data.edgeGraph);
			const viewBox = `0 0 ${bounds.span[0]} ${bounds.span[1]}`;
			const strokeWidth = foldToSvg.getStrokeWidth(data.edgeGraph);
			svg.setAttribute("viewBox", viewBox);
			layer.setAttribute("stroke-width", strokeWidth / 2);
			layer.setAttribute("transform", `translate(${0} ${bounds.span[1]}) scale(1 -1) translate(${-bounds.min[0]} ${-bounds.min[1]})`);
		}
	}

	$: {
		if (rendering) {
			rendering.getElementsByClassName("vertices")[0]
				.setAttribute("visibility", showEpsilon ? "show" : "hidden");
		}
	}

	$: {
		if (rendering && epsilon !== undefined) {
			const verticesGroup = rendering.getElementsByClassName("vertices")[0];
			const vertices = Array.from(verticesGroup.childNodes);
			vertices.forEach(circle => circle.setAttribute("r", epsilon));
			verticesGroup.setAttribute("stroke-width", epsilon / 8);
		}
	}
</script>

	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" bind:this={svg}>
		<g bind:this={layer}></g>
	</svg>

<style>
svg {
	width: 100%;
	height: 100%;
	overflow: visible;
}
/*
:global(svg .boundary) { stroke: #444; }
:global(svg .mountain) { stroke: #e53; }
:global(svg .valley) { stroke: #158; }
:global(svg .flat) { stroke: #666; }
:global(svg .cut) { stroke: #fb4; }
:global(svg .join) { stroke: #333; }
:global(svg .unassigned) { stroke: #a4e; }
*/
/*
:global(svg .boundary) { stroke: #888; }
:global(svg .mountain) { stroke: #888; }
:global(svg .valley) { stroke: #888; }
:global(svg .flat) { stroke: #888; }
:global(svg .cut) { stroke: #888; }
:global(svg .join) { stroke: #888; }
:global(svg .unassigned) { stroke: #888; }

:global(svg .vertices) { fill: #fb45; }
*/

:global(svg .vertices) {
	fill: transparent;
	stroke: black;
}

</style>
