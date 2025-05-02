import { createContext, useCallback, useEffect, useState, useContext } from "react";

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
        {children}
      </AssetViewerContext.Provider>
    );
  }
