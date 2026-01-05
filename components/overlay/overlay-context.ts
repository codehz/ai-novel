import { createContext, useContext } from "react";

/**
 * Reference object for overlay components to control their lifecycle
 */
export interface OverlayRef {
  /**
   * Method to close and remove the overlay from the queue
   */
  close: () => void;
}

/**
 * Represents an item in the overlay queue
 */
export interface OverlayQueueItem {
  id: string;
  component: React.ReactNode;
  ref: OverlayRef;
}

/**
 * Context type defining the overlay queue API
 */
export interface OverlayQueueContextType {
  /**
   * Pushes an overlay component to the queue
   * @param component The overlay component to render
   * @returns A ref object with a close method to remove the overlay
   */
  (component: React.ReactNode): OverlayRef;
}

export const OverlayQueueContext = createContext<OverlayQueueContextType | null>(null);

/**
 * Hook to access the overlay queue context
 * @returns The overlay queue context value
 * @throws Error if used outside of an OverlayQueueProvider
 */
export const useOverlayQueue = () => {
  const context = useContext(OverlayQueueContext);
  if (!context) {
    throw new Error("useOverlayQueue must be used within an OverlayQueueProvider");
  }
  return context;
};
