import { createContext, useCallback, useEffect, useState, useContext, ReactNode, useRef } from "react";

type AssetViewerContextValue = {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  src: string;
};

export const AssetViewerContext = createContext<AssetViewerContextValue | undefined>(undefined);

export function useAssetViewer() {
  const ctx = useContext(AssetViewerContext);
  if (!ctx) throw new Error("useAssetViewer must be used within an AssetViewerProvider");
  return ctx;
}

export function AssetViewerProvider({
  children,
  targetRef,
  src,
}: {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement>;
  src: string;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <AssetViewerContext.Provider
      value={{
        isFullscreen,
        toggleFullscreen,
        src,
      }}
    >
      <TimelineProvider>
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
}: {
  children: ReactNode;
}) {
  const [time, _setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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
