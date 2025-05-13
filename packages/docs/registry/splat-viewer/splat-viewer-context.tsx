"use client";

import { createContext, useCallback, useEffect, useState, useContext, ReactNode, useRef } from "react";

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
   * The source of the asset.
   */
  src: string;
  /**
   * Whether the viewer is interacting with the asset.
   */
  isInteracting: boolean;
  /**
   * The type of camera to use.
   */
  cameraType: 'orbit' | 'fly';
};

export const AssetViewerContext = createContext<AssetViewerContextValue | undefined>(undefined);

export function useAssetViewer() {
  const ctx = useContext(AssetViewerContext);
  if (!ctx) throw new Error("useAssetViewer must be used within an AssetViewerProvider");
  return ctx;
}

export function AssetViewerProvider({
  children,
  autoPlay = false,
  targetRef,
  src,
}: {
  children: React.ReactNode;
  autoPlay?: boolean;
  targetRef: React.RefObject<HTMLElement>;
  src: string;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraType] = useState<'orbit' | 'fly'>('orbit');

  const toggleFullscreen = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, [targetRef]);

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
        cameraType
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
  const subscribers = useRef(new Set<(v: number) => void>());

  const setTime = useCallback((value: number) => {
    timeRef.current = value;
    subscribers.current.forEach((fn) => fn(value));
  }, []);

  const getTime = useCallback(() => timeRef.current, []);

  const subscribe = useCallback((fn: (v: number) => void) => {
    subscribers.current.add(fn);
    return () => subscribers.current.delete(fn);
  }, []);

  // Example: when time is changed and user commits it
  const onCommit = useCallback((value: number) => {
    timeRef.current = value;
    setTime(value);
    _setTime(value);
  }, []);

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
