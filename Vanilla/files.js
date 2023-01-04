const updateViewSettings = () => {
	if (origami.frame_classes) {
		if (origami.frame_classes.includes("creasePattern")) {
			perspective = "orthographic";
			viewClass = "creasePattern";
		} else if (origami.frame_classes.includes("foldedForm")) {
			perspective = "perspective";
			viewClass = "foldedForm";
		}
	}
};

window.addEventListener("load", (event) => {
	fetch("../fold/huffman.fold")
		.then(str => str.json())
		.then(data => {
			origami = data;
			updateViewSettings();
			rebuildAllAndDraw();
		});
});

document.querySelector("input[type=file]")
	.addEventListener('input', (event) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			origami = JSON.parse(event.target.result);
			updateViewSettings();
			rebuildAllAndDraw();
		};
		reader.readAsText(event.target.files[0]);
	});

document.querySelector("#button-folded")
	.addEventListener("click", (event) => {
		fetch("../fold/huffman.fold")
			.then(str => str.json())
			.then(data => {
				origami = data;
				updateViewSettings();
				rebuildAllAndDraw();
			});
	});

document.querySelector("#button-cp")
	.addEventListener("click", (event) => {
		fetch("../fold/kraft-bird-base-06-mvf.fold")
			.then(str => str.json())
			.then(data => {
				origami = data;
				updateViewSettings();
				rebuildAllAndDraw();
			});
	});
