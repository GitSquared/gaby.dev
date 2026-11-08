import { startOcean } from './ocean.js';

const canvas = document.querySelector('#ocean');
const mobile = matchMedia('(max-width: 700px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const settings = { swell: 0.8, detail: 0.23, speed: 1, moon: 0.7, stars: 0.82, pixel: 3, dither: 0.65, palette: 0, horizon: 0.48 };

startOcean(canvas, () => ({
 ...settings,
 // Use CSS viewport dimensions so the grain stays consistent across display densities.
 pixel: Math.max(2.5, Math.min(4, 2.5 + (canvas.clientWidth - 390) / 1050)),
 frameHeight: mobile.matches ? innerHeight / canvas.clientHeight : 1,
 horizon: mobile.matches ? 0.73 : settings.horizon,
}), {
 isPaused: () => reducedMotion.matches,
 onError: () => { canvas.hidden = true; },
});
