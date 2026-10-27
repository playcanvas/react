import type { GraphicsDevice } from 'playcanvas';

/**
 * Caps the pixel ratio a graphics device renders at, until the returned function is called.
 *
 * The device is handed the ratio in effect rather than the cap: the smaller of `maxPixelRatio` and
 * the display's own pixel ratio. The engine takes that minimum itself when it sizes the canvas, but
 * reads `maxPixelRatio` back as the ratio in effect elsewhere, such as when the picker maps pointer
 * positions to canvas pixels. The ratio is applied again when the display's pixel ratio changes (the
 * window moves to another monitor, or the page is zoomed), and when the device is restored after a
 * loss, which resets it on WebGPU.
 *
 * @param device - The graphics device.
 * @param maxPixelRatio - The maximum pixel ratio to render at.
 * @returns A function that stops following the display and hands back the device's own ratio.
 */
export const applyMaxPixelRatio = (device: GraphicsDevice, maxPixelRatio: number) => {
    const defaultRatio = device.maxPixelRatio;
    let displayQuery: MediaQueryList | null = null;

    const update = () => {
        device.maxPixelRatio = Math.min(maxPixelRatio, window.devicePixelRatio);

        // A resolution query only reports the first change away from the ratio it was created with,
        // so watch the display's current ratio again. matchMedia is missing in some environments, such as jsdom.
        displayQuery?.removeEventListener('change', update);
        displayQuery =
            typeof window.matchMedia === 'function'
                ? window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
                : null;
        displayQuery?.addEventListener('change', update);
    };

    update();

    // WebGPU resets the ratio when it restores a lost device, and reports the restore from engine 2.19
    device.on('devicerestored', update);

    return () => {
        device.off('devicerestored', update);
        displayQuery?.removeEventListener('change', update);
        device.maxPixelRatio = defaultRatio;
    };
};
