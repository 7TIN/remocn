"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { RegistryEntry } from "@/registry/__index__";
import { downloadBlob } from "../lib/download";
import { buildExportComposition } from "../lib/export-settings";
import type { GitHubStarsInputProps, Orientation } from "../lib/types";

type DownloadArgs = {
  entry: RegistryEntry;
  inputProps: GitHubStarsInputProps;
  orientation: Orientation;
  filename: string;
};

/**
 * Owns the WebCodecs MP4 export: feature-detect, progress, the export
 * AbortController, and the dynamic web-renderer import + blob download.
 */
export function useMp4Export() {
  const [supportsExport, setSupportsExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const exportAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Feature-detect WebCodecs after mount (avoids hydration mismatch).
    setSupportsExport(
      typeof window !== "undefined" &&
        typeof window.VideoEncoder !== "undefined",
    );
  }, []);

  const download = useCallback(
    async ({ entry, inputProps, orientation, filename }: DownloadArgs) => {
      if (!supportsExport) {
        toast.info("MP4 export needs Chrome or Edge");
        return;
      }

      const controller = new AbortController();
      exportAbortRef.current = controller;
      setExporting(true);
      setProgress(0);

      try {
        const { renderMediaOnWeb } = await import("@remotion/web-renderer");
        const { getBlob } = await renderMediaOnWeb({
          composition: buildExportComposition(entry, orientation),
          inputProps,
          container: "mp4",
          signal: controller.signal,
          onProgress: ({ progress }) => setProgress(progress),
        });

        const blob = await getBlob();
        downloadBlob(blob, filename);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          // Surface the real cause (e.g. a Remotion version mismatch) instead of
          // swallowing it — the toast stays friendly, the console is diagnosable.
          console.error("[stars] MP4 export failed:", err);
          const detail = err instanceof Error ? err.message : String(err);
          toast.error("Export failed", { description: detail });
        }
      } finally {
        setExporting(false);
        exportAbortRef.current = null;
      }
    },
    [supportsExport],
  );

  const cancel = useCallback(() => {
    exportAbortRef.current?.abort();
  }, []);

  return { supportsExport, exporting, progress, download, cancel };
}
