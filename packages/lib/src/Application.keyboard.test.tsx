import { fireEvent, render, waitFor } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { Application as PlayCanvasApplication } from 'playcanvas';
import { KEY_RIGHT, Keyboard } from 'playcanvas';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Application } from './Application.tsx';
import { useApp } from './hooks/index.ts';

// These tests run against the real engine. The mock in test/setup.ts builds a stand-in application
// with its own input devices, so it never sees the keyboard that <Application> creates.
vi.unmock('playcanvas');

// Renders an application and resolves with the engine application once it has been created
const renderApplication = async (options?: RenderOptions) => {
    const onApp = vi.fn();
    const CaptureApp = () => {
        const app = useApp();
        useEffect(() => onApp(app), [app]);
        return null;
    };

    const result = render(
        <Application deviceTypes={['null']}>
            <CaptureApp />
        </Application>,
        options
    );

    await waitFor(() => expect(onApp).toHaveBeenCalled());

    return { ...result, app: onApp.mock.calls[0][0] as PlayCanvasApplication };
};

describe('Application keyboard', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Scripts and hooks read app.keyboard, for example to push a rigid body while a key is held
    it('gives the application a keyboard that listens on the window', async () => {
        const { app } = await renderApplication();

        expect(app.keyboard).toBeInstanceOf(Keyboard);

        fireEvent.keyDown(window, { keyCode: KEY_RIGHT });
        expect(app.keyboard!.isPressed(KEY_RIGHT)).toBe(true);

        fireEvent.keyUp(window, { keyCode: KEY_RIGHT });
        expect(app.keyboard!.isPressed(KEY_RIGHT)).toBe(false);
    });

    it('leaves one keyboard attached in StrictMode and detaches it on unmount', async () => {
        const attach = vi.spyOn(Keyboard.prototype, 'attach');
        const detach = vi.spyOn(Keyboard.prototype, 'detach');
        const attached = () => attach.mock.contexts.filter((keyboard) => !detach.mock.contexts.includes(keyboard));

        // StrictMode mounts, unmounts and remounts. The first mount is either abandoned before it
        // creates an application (as here, where act() flushes the remount first) or its application
        // is created and then destroyed (as in a browser). Either way, one keyboard stays attached.
        const { app, unmount } = await renderApplication({ reactStrictMode: true });
        const keyboard = app.keyboard!;

        expect(attached()).toHaveLength(1);
        expect(attached()[0]).toBe(keyboard);

        unmount();

        expect(attached()).toHaveLength(0);
        expect(app.keyboard).toBeNull();

        // Key presses no longer reach it
        fireEvent.keyDown(window, { keyCode: KEY_RIGHT });
        expect(keyboard.isPressed(KEY_RIGHT)).toBe(false);
    });
});
