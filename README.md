# WebGL FOLD file view

Render a [FOLD file](https://github.com/edemaine/FOLD/) in an HTML canvas with WebGL.

### features

- two drawing styles, one for crease patterns, one for folded models.
- the crease pattern style features thick lines, computed on a shader.
- the folded model style features the ability to sort layer ordering in accordance with the [FOLD spec](https://github.com/edemaine/fold/blob/main/doc/spec.md#layer-information-faceorders-and-edgeorders)
- ability to view different [file frames](https://github.com/edemaine/fold/blob/main/doc/spec.md#multiple-frames) if a FOLD file contains them.
- orthographic, perspective, field of view, touch to pan and rotate

### WebGL

All WebGL boilerplate, projection, shaders, and rendering has been incorporated into the Rabbit Ear base project, located in `src/webgl/` in [this repo](https://github.com/robbykraft/Origami/).

### developers

If you would like to include a WebGL origami view canvas on your site, check out the code in one of these three examples:

- [Svelte](https://github.com/robbykraft/webgl-fold/tree/main/Svelte)
- [SolidJS](https://github.com/robbykraft/webgl-fold/tree/main/SolidJS)
- [vanilla Javascript](https://github.com/robbykraft/webgl-fold/tree/main/Vanilla)

Include [Rabbit Ear](https://rabbitear.org) in your project and copy the code from one of these three example projects to get going.

### license

MIT
