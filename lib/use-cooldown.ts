"use client";

import { useEffect, useState } from "react";

export function useCooldown(seconds = 30) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  return {
    left,
    start() {
      setLeft(seconds);
    },
  };
}
