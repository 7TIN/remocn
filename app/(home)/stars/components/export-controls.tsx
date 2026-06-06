import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Download MP4 button with the exporting (progress + cancel) and unsupported
 *  (muted + tooltip) variants. */
export function ExportControls({
  supportsExport,
  exporting,
  exportProgress,
  onDownload,
  onCancelExport,
}: {
  supportsExport: boolean;
  exporting: boolean;
  exportProgress: number;
  onDownload: () => void;
  onCancelExport: () => void;
}) {
  if (exporting) {
    return (
      <div className="flex w-full items-center gap-3 sm:w-72">
        <Progress
          value={Math.round(exportProgress * 100)}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancelExport}
          aria-label="Cancel export"
          className="rounded-full"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  if (supportsExport) {
    return (
      <Button size="lg" onClick={onDownload} className="gap-2 rounded-full">
        <Download className="size-4" aria-hidden="true" />
        Download MP4
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          // Not the native `disabled` attribute — a disabled button
          // suppresses hover/click, hiding the tooltip and the info toast.
          // Style it muted and let onDownload surface the Chrome/Edge hint.
          <Button
            size="lg"
            aria-disabled
            onClick={onDownload}
            className="gap-2 rounded-full opacity-50"
          >
            <Download className="size-4" aria-hidden="true" />
            Download MP4
          </Button>
        }
      />
      <TooltipContent>MP4 export needs Chrome or Edge</TooltipContent>
    </Tooltip>
  );
}
