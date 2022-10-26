# WebGL FOLD file view

Render a [FOLD file](https://github.com/edemaine/FOLD/) in an HTML canvas with WebGL.

### features

- two drawing styles, one for crease patterns, one for folded models.
- the crease pattern style features thick lines, computed on a shader.
- orthographic and perspective
- basic touch input for panning, rotating

### project structure

the code itself is located in the `src/` folder. This contains everything related to WebGL programs, shaders, uniforms, drawing, view matrices, and deallocating.

To see the project in action, you want to check out one of the examples. Redundant single-page apps have been created in in popular front-end Javascript libraries including one vanilla JS example.

### developers

run `npm i` in the root, then navigate to whichever front end library and run `npm i` again.

Then, depending on your front end of choice, run whichever `npm run dev` or `npm run`, whatever the particular library uses.

unfortunately, this currently requires the nightly build of Rabbit Ear. place it in the corresponding local folder, referenced from package.json (and whichever nested package.json).
