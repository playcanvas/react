"use client";

import { createContext, useCallback, useEffect, useState, useContext, ReactNode, useRef } from "react";
import { CameraMode } from "./splat-viewer";
import { useSubscribe } from "./hooks/use-subscribe";

type AssetViewerContextValue = {
  /**
   * Whether the viewer is in fullscreen mode.
   */
  isFullscreen: boolean;

  /**
   * Toggles the fullscreen mode.
   */
  toggleFullscreen: () => void;

  /**
   * Triggers a download of the asset.
   */
  triggerDownload: () => void;

  /**
   * The source of the asset.
   */
  src: string | Record<string, unknown>;

  /**
   * Whether the viewer is interacting with the asset.
   */
  isInteracting: boolean;

  /**
   * The type of camera to use.
   */
  mode: CameraMode;

  /**
   * The type of camera to use.
   */
  setMode: (mode: CameraMode) => void;

  /**
   * The overlay to display.
   * @defaultValue null
   */
  overlay: "help" | "settings" | null;

  /**
   * Toggles the overlay.
   */
  setOverlay: (overlay: "help" | "settings" | null) => void;

  /**
   * Whether the auto rotate is enabled.
   */
  autoRotate: boolean;

  /**
   * Toggles the auto rotate.
   */
  setAutoRotate: (autoRotate: boolean) => void;

  /**
   * Subscribes to the asset progress.
   */
  subscribe: (fn: (progress: number) => void) => () => void;
};

export const AssetViewerContext = createContext<AssetViewerContextValue | undefined>(undefined);

export function useAssetViewer() {
  const ctx = useContext(AssetViewerContext);
  if (!ctx) throw new Error("useAssetViewer must be used within an AssetViewerProvider");
  return ctx;
}

function isMacPlatform(): boolean {
  // @ts-expect-error this is not available on all browsers
  const userAgentData = navigator.userAgentData;
  if (userAgentData?.platform) {
    return userAgentData.platform === "macOS";
  }

  // Fallback for older browsers
  return /Mac/i.test(navigator.userAgent || "");
}

export function AssetViewerProvider({
  children,
  autoPlay = false,
  targetRef,
  mode,
  setMode,
  src,
  subscribe,
}: {
  children: React.ReactNode;
  autoPlay?: boolean;
  targetRef: React.RefObject<HTMLElement>;
  src: string | Record<string, unknown>;
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  subscribe: (fn: (progress: number) => void) => () => void;
}) {
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [overlay, setOverlay] = useState<"help" | "settings" | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // download
  const triggerDownload = useCallback(() => {
    if (typeof src === 'string') {
      // Single file download
      const link = document.createElement('a');
      link.href = src;
      link.download = src.split('/').pop() || 'splat.ply';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Multiple file download for SogsMeta
      const files = Object.values(src).reduce<string[]>((acc, value) => {
        if (value && typeof value === 'object' && 'files' in value) {
          return [...acc, ...(value.files as string[])];
        }
        return acc;
      }, []);
      
      // Download each file sequentially
      files.forEach((file, index) => {
        const link = document.createElement('a');
        link.href = file;
        link.download = file.split('/').pop() || `splat_${index}.texture`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }, [src]);

  // toggle help dialog
  const handleKey = useCallback((e: KeyboardEvent) => {
    const isCmdOrCtrl = isMacPlatform() ? e.metaKey : e.ctrlKey;

    if (e.key === "?" && e.shiftKey) setOverlay('help') // help
    if (e.key.toLowerCase() === "f" && e.shiftKey && isCmdOrCtrl) toggleFullscreen() // fullscreen
    if (e.key.toLowerCase() === "d" && e.shiftKey && isCmdOrCtrl) triggerDownload() // download
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])


  // toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const el = targetRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setOverlay(null)
      setIsFullscreen(false);
    } else {
      await el.requestFullscreen();
      setOverlay(null)
      setIsFullscreen(true);
    }
  }, [targetRef]);

  // handle fullscreen state
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // handle interaction state
  const [isInteracting, setIsInteracting] = useState(false);
  const isInteractingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onInteract = () => {
      if (!isInteractingRef.current) {
        isInteractingRef.current = true;
        setIsInteracting(true);
      }

      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        setIsInteracting(false);
      }, 2000);
    };

    el.addEventListener("mousemove", onInteract);
    el.addEventListener("keydown", onInteract);
    el.addEventListener("pointerdown", onInteract);

    return () => {
      clearTimeout(timeoutRef.current!);
      timeoutRef.current = null;
      el.removeEventListener("mousemove", onInteract);
      el.removeEventListener("keydown", onInteract);
      el.removeEventListener("pointerdown", onInteract);
    };
  }, [targetRef]);

  return (
    <AssetViewerContext.Provider
      value={{
        isFullscreen,
        isInteracting,
        toggleFullscreen,
        src,
        mode,
        setMode,
        overlay,
        setOverlay,
        triggerDownload,
        autoRotate,
        setAutoRotate,
        subscribe
      }}
    >
      <TimelineProvider autoPlay={autoPlay}>
        {children}
      </TimelineProvider>
    </AssetViewerContext.Provider>
  );
}
  
type TimelineContextValue = {
  getTime: () => number;
  setTime: (value: number) => void;
  onCommit?: (value: number) => void;
  subscribe: (fn: (value: number) => void) => () => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
};

const TimelineContext = createContext<TimelineContextValue | undefined>(undefined);

export function useTimeline() {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error("useTimeline must be used within a TimelineProvider");
  return ctx;
}

export function TimelineProvider({
  children,
  autoPlay = false,
}: {
  children: ReactNode;
  autoPlay?: boolean;
}) {
  const [time, _setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timeRef = useRef(time);
  const rafIdRef = useRef<number | null>(null);
  const { subscribe, notify } = useSubscribe<number>();

  const setTime = useCallback((value: number) => {
    timeRef.current = value;
    notify(value);
  }, [notify]);

  const getTime = useCallback(() => timeRef.current, []);

  // Example: when time is changed and user commits it
  const onCommit = useCallback((value: number) => {
    timeRef.current = value;
    setTime(value);
    _setTime(value);
  }, [setTime]);

  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const step = (timestamp: number) => {
        if (lastTimestampRef.current == null) {
          lastTimestampRef.current = timestamp;
        }

        const delta = (timestamp - lastTimestampRef.current) / 1000;
        lastTimestampRef.current = timestamp;

        setTime(getTime() + delta);
        rafIdRef.current = requestAnimationFrame(step);
      };

      lastTimestampRef.current = null;
      rafIdRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, getTime, setTime]);

  return (
    <TimelineContext.Provider
      value={{ getTime, setTime, onCommit, subscribe, isPlaying, setIsPlaying }}
    >
      {children}
    </TimelineContext.Provider>
  );
}
