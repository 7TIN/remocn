"use client";

import type { PlayerRef } from "@remotion/player";
import { useCallback, useRef, useState } from "react";

/** Owns the Remotion PlayerRef play/pause toggle + the mirrored playing flag. */
export function usePlayerControls(initialPlaying: boolean) {
  const ref = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(initialPlaying);

  const togglePlay = useCallback(() => {
    const p = ref.current;
    if (!p) return;
    if (p.isPlaying()) {
      p.pause();
      setPlaying(false);
    } else {
      p.play();
      setPlaying(true);
    }
  }, []);

  return { ref, playing, togglePlay };
}
