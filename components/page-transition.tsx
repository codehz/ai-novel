"use client";

import { AutoTransition, TransitionPlugin } from "@codehz/auto-transition";
import { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <AutoTransition as="main" className="flex-1 container mx-auto px-4 py-8 relative" transition={plugin}>
      {children}
    </AutoTransition>
  );
}

const plugin: TransitionPlugin = {
  enter(el) {
    return el.animate(
      [
        { opacity: 0, transform: "translateY(24px)", filter: "blur(4px)" },
        { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" },
      ],
      { duration: 150, easing: "ease-in" },
    );
  },
  exit(el) {
    const off = window.scrollY;
    window.scrollTo(0, 0);
    return el.animate(
      [
        {
          opacity: 1,
          transform: `translateY(${-off}px)`,
          position: "absolute",
          top: "32px",
          left: "16px",
          right: "16px",
          filter: "blur(0px)",
        },
        {
          opacity: 0,
          transform: `translateY(${-off - 24}px)`,
          position: "absolute",
          top: "32px",
          left: "16px",
          right: "16px",
          filter: "blur(4px)",
        },
      ],
      { duration: 150, easing: "ease-in" },
    );
  },
};
