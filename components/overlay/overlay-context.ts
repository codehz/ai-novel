"use client";

import { createContext, ReactNode, use } from "react";

/**
 * Reference object for overlay components to control their lifecycle
 */
export interface OverlayRef {
  /**
   * Method to close and remove the overlay from the queue
   */
  close: () => void;
}

export const OverlayRef = createContext<OverlayRef | null>(null);

export const useOverlayRef = () => {
  const context = use(OverlayRef);
  if (!context) {
    throw new Error("useOverlayRef must be used within an overlay item");
  }
  return context;
};

/**
 * Represents an item in the overlay queue
 */
export interface OverlayQueueItem {
  id: string;
  component: ReactNode;
  ref: OverlayRef;
}

/**
 * Context type defining the overlay queue API
 */
export interface OverlayQueueContextType {
  show(component: ReactNode): OverlayRef;
}

export const OverlayQueueContext = createContext<OverlayQueueContextType | null>(null);

/**
 * Hook to access the overlay queue context
 * @returns The overlay queue context value
 * @throws Error if used outside of an OverlayQueueProvider
 */
export const useOverlayQueue = () => {
  const context = use(OverlayQueueContext);
  if (!context) {
    throw new Error("useOverlayQueue must be used within an OverlayQueueProvider");
  }
  return context;
};
