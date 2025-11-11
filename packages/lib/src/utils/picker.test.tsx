import React, { useEffect, useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { usePicker } from './picker.tsx';
import * as pc from 'playcanvas';
import { Entity } from '../Entity.tsx';
import { AppContext, ParentContext } from '../hooks/index.ts';
import { PointerEventsContext } from '../contexts/pointer-events-context.tsx';

/**
 * Creates a test canvas with a mock bounding client rect
 */
const createTestCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return canvas;
};

/**
 * Creates a mock app with an update handler that collects update callbacks
 */
const createAppWithUpdateCollector = (canvas: HTMLCanvasElement) => {
  const updateHandlers: Array<() => void> = [];
  const app = ({
    on: (evt: string, cb: () => void) => { if (evt === 'update') updateHandlers.push(cb); },
    off: vi.fn(),
    scene: {},
    root: { findComponents: vi.fn().mockReturnValue([{ priority: 1, renderTarget: null }]) },
    graphicsDevice: { canvas, width: canvas.width, height: canvas.height, maxPixelRatio: 1 },
  } as unknown) as pc.AppBase;
  return { app, updateHandlers };
};

/**
 * Creates a mock Picker with spies for its methods
 * @returns An object containing the spies for the Picker methods
 */
const mockPicker = () => {
  const prepareSpy = vi.fn();
  const getSelectionSpy = vi.fn().mockResolvedValue([null]);
  const resizeSpy = vi.fn();
  const pickerCtorSpy = vi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .spyOn(pc as any, 'Picker')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation(function MockPicker(this: unknown, ...args: unknown[]): any {
      void args;
      return {
        prepare: prepareSpy,
        getSelectionAsync: getSelectionSpy,
        resize: resizeSpy,
      };
    });
  return { prepareSpy, getSelectionSpy, resizeSpy, pickerCtorSpy };
};

/**
 * Renders a harness that attaches the canvas to the DOM and uses the usePicker hook
 */
const renderHarness = (app: pc.AppBase, canvas: HTMLCanvasElement, pointerEvents: Set<string>) => {
  const Harness = () => {
    const elRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => { elRef.current?.appendChild(canvas); }, []);
    usePicker(app, canvas, pointerEvents);
    return <div ref={elRef} />;
  };
  return render(<Harness />);
};

describe('usePicker', () => {
  it('does not prepare or select when no pointer events are added', async () => {
    const { prepareSpy, getSelectionSpy, pickerCtorSpy } = mockPicker();
    const canvas = createTestCanvas();
    const { app, updateHandlers } = createAppWithUpdateCollector(canvas);
    const pointerEvents = new Set<string>();

    renderHarness(app, canvas, pointerEvents);

    // 1) No listeners: frame update should not prepare
    updateHandlers.forEach((fn) => fn());
    expect(prepareSpy).not.toHaveBeenCalled();
    expect(getSelectionSpy).not.toHaveBeenCalled();

    // 2) No listeners: interaction should not prepare
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    expect(prepareSpy).not.toHaveBeenCalled();
    expect(getSelectionSpy).not.toHaveBeenCalled();

    // 3) Add a listener: simulate pointer move, then frame update should prepare
    pointerEvents.add('some-mocked-event-listener');
    fireEvent.pointerMove(canvas, { clientX: 12, clientY: 18 });
    updateHandlers.forEach((fn) => fn());
    expect(prepareSpy).toHaveBeenCalled();

    // 4) Interaction should also prepare and try to select
    fireEvent.pointerDown(canvas, { clientX: 15, clientY: 20 });
    expect(getSelectionSpy).toHaveBeenCalled();

    // 5) Remove the last listener: subsequent frames/interactions skip prepare
    pointerEvents.clear();
    prepareSpy.mockClear();
    getSelectionSpy.mockClear();

    updateHandlers.forEach((fn) => fn());
    fireEvent.pointerDown(canvas, { clientX: 5, clientY: 5 });
    expect(prepareSpy).not.toHaveBeenCalled();
    expect(getSelectionSpy).not.toHaveBeenCalled();

    // Ensure our Picker constructor was invoked once for the memoized instance
    expect(pickerCtorSpy).toHaveBeenCalledTimes(1);
  });

  it('resizes picker on canvas resize and unsubscribes on unmount', async () => {
    const { resizeSpy } = mockPicker();

    // Capture ResizeObserver callbacks
    const observedCallbacks: Array<() => void> = [];
    const RO = vi.fn(function MockResizeObserver(this: unknown, cb: () => void) {
      return {
        observe: vi.fn(() => observedCallbacks.push(cb)),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    });
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = RO as unknown;

    const canvas = createTestCanvas();
    const { app, updateHandlers } = createAppWithUpdateCollector(canvas);
    const pointerEvents = new Set<string>();

    const { unmount } = renderHarness(app, canvas, pointerEvents);

    // Trigger ResizeObserver
    observedCallbacks.forEach((cb) => cb());
    expect(resizeSpy).toHaveBeenCalledWith(800, 600);

    // Unmount should unsubscribe update
    expect(updateHandlers.length).toBe(1);
    const registeredUpdate = updateHandlers[0];
    unmount();
    expect(app.off).toHaveBeenCalledWith('update', registeredUpdate);
  });

  it('Entity registers/unregisters pointer events and picker responds only when present', async () => {
    const { prepareSpy, pickerCtorSpy } = mockPicker();

    // Create a real mocked PlayCanvas application (from test setup)
    const app = new pc.Application(document.createElement('canvas'), {
      graphicsDevice: new pc.NullGraphicsDevice(document.createElement('canvas')),
      touch: new pc.TouchDevice(document.createElement('canvas')),
      mouse: new pc.Mouse(document.createElement('canvas')),
    });

    // Use the application's actual canvas for usePicker
    const appCanvas = (app.graphicsDevice as unknown as { canvas: HTMLCanvasElement }).canvas;
    Object.assign(appCanvas, {
      width: 800,
      height: 600,
      getBoundingClientRect: () => ({
        left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({})
      }),
    });

    // Provide a camera stub so picking path runs
    vi.spyOn(app.root, 'findComponents').mockReturnValue([{ priority: 1, renderTarget: null }] as unknown as pc.CameraComponent[]);

    const pointerEvents = new Set<string>();

    const Harness = ({ withEntity }: { withEntity: boolean }) => {
      const elRef = useRef<HTMLDivElement | null>(null);
      useEffect(() => { elRef.current?.appendChild(appCanvas); }, []);
      usePicker(app as unknown as pc.AppBase, appCanvas, pointerEvents);
      return (
        <div ref={elRef}>
          <AppContext.Provider value={app}>
            <PointerEventsContext.Provider value={pointerEvents}>
              <ParentContext.Provider value={app.root}>
                {withEntity ? (
                  <Entity onPointerDown={() => { /* no-op */ }} />
                ) : null}
              </ParentContext.Provider>
            </PointerEventsContext.Provider>
          </AppContext.Provider>
        </div>
      );
    };

    const { rerender, unmount } = render(<Harness withEntity={false} />);

    // No entity with handlers → pointerEvents empty → no prepare on update
    expect(pointerEvents.size).toBe(0);
    fireEvent.pointerMove(appCanvas, { clientX: 10, clientY: 10 });
    app.fire('update');
    expect(prepareSpy).not.toHaveBeenCalled();

    // Mount entity with a pointer handler → picker should prepare on update
    rerender(<Harness withEntity={true} />);
    expect(pointerEvents.size).toBe(1);
    fireEvent.pointerMove(appCanvas, { clientX: 20, clientY: 20 });
    app.fire('update');
    expect(prepareSpy).toHaveBeenCalled();

    // Remove entity → pointerEvents cleared → picker no longer prepares
    prepareSpy.mockClear();
    rerender(<Harness withEntity={false} />);
    expect(pointerEvents.size).toBe(0);
    fireEvent.pointerMove(appCanvas, { clientX: 30, clientY: 30 });
    app.fire('update');
    expect(prepareSpy).not.toHaveBeenCalled();

    expect(pickerCtorSpy).toHaveBeenCalledTimes(1);
    unmount();
  });
});


