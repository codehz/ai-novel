"use client";

import React, { ReactNode, useCallback, useRef, useState } from "react";
import { OverlayQueueContext, OverlayQueueItem, OverlayRef } from "./overlay-context";

export function OverlayQueue({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<OverlayQueueItem[]>([]);
  const idCounter = useRef(0);

  /**
   * Pushes an overlay component to the queue
   * @param component The overlay component to render
   * @returns A ref object with a close method to remove the overlay
   */
  const push = useCallback((component: React.ReactNode) => {
    const id = `overlay-${idCounter.current++}`;
    const ref: OverlayRef = {
      close: () => setOverlays((prev) => prev.filter((overlay) => overlay.id !== id)),
    };

    const newOverlay: OverlayQueueItem = {
      id,
      component,
      ref,
    };

    setOverlays((prev) => [...prev, newOverlay]);
    return ref;
  }, []);

  return (
    <OverlayQueueContext value={push}>
      {children}
      {overlays.map(({ id, component }) => (
        <React.Fragment key={id}>{component}</React.Fragment>
      ))}
    </OverlayQueueContext>
  );
}
