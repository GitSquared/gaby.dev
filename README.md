## gaby.dev

[personal homepage](https://gaby.dev)

Run `npm run dev`, or serve `public/` with any static server. No build step or
runtime dependencies are required.

The WebGL backdrop uses directional swells, Perlin noise, ordered dithering, and
randomized shooting stars. It renders at up to 30 fps with a capped resolution;
pixels scale with the viewport width. Hidden pages stop rendering, and
reduced-motion preferences show a still sea. The scene follows the system colour
scheme: a starry night in dark mode, a sunlit sea in light mode, easing between
the two when the preference changes. The mobile canvas scrolls with the page.
