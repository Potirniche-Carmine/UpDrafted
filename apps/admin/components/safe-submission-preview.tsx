"use client";

import * as React from "react";
import { FileSearch, Link2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPreviewHostname,
  getSafePdfPreviewUrl,
  toSafePreviewUrl,
  type SafePreviewTarget,
} from "@/lib/submission-preview";

export function SafeSubmissionPreview({
  targets,
  emptyMessage = "No previewable links were submitted.",
}: {
  targets: SafePreviewTarget[];
  emptyMessage?: string;
}) {
  const safeTargets = React.useMemo(() => {
    return targets.reduce<SafePreviewTarget[]>((items, target) => {
      const safeUrl = toSafePreviewUrl(target.url);
      if (!safeUrl) return items;
      items.push({ ...target, url: safeUrl });
      return items;
    }, []);
  }, [targets]);
  const [activeId, setActiveId] = React.useState(safeTargets[0]?.id ?? "");

  React.useEffect(() => {
    if (!safeTargets.some((target) => target.id === activeId)) {
      setActiveId(safeTargets[0]?.id ?? "");
    }
  }, [activeId, safeTargets]);

  if (safeTargets.length === 0) {
    return (
      <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
        <p className="text-sm text-[color:var(--muted-foreground)]">{emptyMessage}</p>
      </section>
    );
  }

  const activeTarget = safeTargets.find((target) => target.id === activeId) ?? safeTargets[0];
  const previewUrl =
    activeTarget.kind === "pdf" ? getSafePdfPreviewUrl(activeTarget.url) : activeTarget.url;

  return (
    <section className="space-y-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <LockKeyhole className="size-4 text-[color:var(--primary)]" />
            Sandboxed preview
          </h3>
          <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">
            {activeTarget.kind === "pdf" ? "PDF" : getPreviewHostname(activeTarget.url)} -{" "}
            scripts, forms, popups, and downloads blocked
          </p>
        </div>

        {safeTargets.length > 1 ? (
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-[color:var(--border)] bg-[color:var(--card)]/60 p-1">
            {safeTargets.map((target, index) => (
              <Button
                key={target.id}
                type="button"
                variant={target.id === activeTarget.id ? "secondary" : "ghost"}
                size="sm"
                className="h-8 shrink-0 px-2 text-xs"
                onClick={() => setActiveId(target.id)}
              >
                {target.kind === "pdf" ? (
                  <FileSearch className="size-3.5" />
                ) : (
                  <Link2 className="size-3.5" />
                )}
                {index + 1}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-black">
        <iframe
          key={activeTarget.id}
          title={`Sandboxed preview of ${activeTarget.label}`}
          src={previewUrl}
          sandbox=""
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-[26rem] w-full bg-white sm:h-[34rem]"
        />
      </div>

      <div className="flex min-w-0 items-start gap-2 text-xs text-[color:var(--muted-foreground)]">
        {activeTarget.kind === "pdf" ? (
          <FileSearch className="mt-0.5 size-3.5 shrink-0" />
        ) : (
          <Link2 className="mt-0.5 size-3.5 shrink-0" />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-medium text-[color:var(--foreground)]",
              !activeTarget.description && "mb-0",
            )}
          >
            {activeTarget.label}
          </p>
          {activeTarget.description ? <p className="truncate">{activeTarget.description}</p> : null}
          <p className="truncate">{activeTarget.url}</p>
        </div>
      </div>
    </section>
  );
}
