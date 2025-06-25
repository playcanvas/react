"use client";

import { useEffect, useRef, useState } from "react";
import { useAssetViewer } from "./splat-viewer-context.ts";
import { cn } from "@lib/utils";

type ProgressProps = {
  variant?: "top" | "bottom";
  className?: string;
  style?: React.CSSProperties;
};

export function Progress({ variant = "top", className, style }: ProgressProps) {
  const { subscribe } = useAssetViewer();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<number>(null);

  useEffect(() => {
    const unsubscribe = subscribe((progress) => {
      if (!ref.current) return;
      ref.current.style.width = `${progress * 100}%`;

      if (progress >= 1) {
        timeoutRef.current = setTimeout(() => setVisible(false), 500);
      } else {
        setVisible(true);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [subscribe]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 w-full h-1 bg-accent transition-[width] duration-300 will-change-[width]",
        variant === "top" && "top-0",
        variant === "bottom" && "bottom-0",
        className
      )}
      style={{ width: "0%", ...style }}
    />
  );
}