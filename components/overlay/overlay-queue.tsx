"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import { OverlayQueueContext, OverlayQueueItem, OverlayRef } from "./overlay-context";

export function OverlayQueue({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<OverlayQueueItem[]>([]);
  const idCounter = useRef(0);

  const value = useMemo(
    () => ({
      show: (component: ReactNode) => {
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
      },
    }),
    [],
  );

  return (
    <OverlayQueueContext value={value}>
      {children}
      {overlays.map(({ id, component, ref }) => (
        <OverlayRef key={id} value={ref}>
          {component}
        </OverlayRef>
      ))}
    </OverlayQueueContext>
  );
}
