"use client";

import { INSTALL_ALL_COMMAND } from "@/config/site";
import { CopyableButton } from "./copyable-block";

export function InstallAll({ className }: { className?: string }) {
  return (
    <CopyableButton
      value={INSTALL_ALL_COMMAND}
      label="Install all"
      event={{
        component: "install_all",
        packageManager: "npm",
        surface: "landing",
      }}
      className={className}
    />
  );
}
