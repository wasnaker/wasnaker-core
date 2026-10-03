"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/classnames.js";

export type SplitViewProps = {
  list: ReactNode;
  detail: ReactNode;
  detailOpen: boolean;
  onClose: () => void;
  detailTitle: ReactNode;
  labels: { list: string; detail: string; close: string };
  className?: string;
};

export function SplitView({
  list,
  detail,
  detailOpen,
  onClose,
  detailTitle,
  labels,
  className,
}: SplitViewProps) {
  const panel = useRef<HTMLElement>(null);
  const listPanel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (detailOpen && !wasOpen.current) {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      panel.current?.focus();
    } else if (!detailOpen && wasOpen.current) {
      if (opener.current?.isConnected) opener.current.focus();
      else listPanel.current?.focus();
    }
    wasOpen.current = detailOpen;
  }, [detailOpen]);
  return (
    <div
      className={cn(
        "split-view grid min-w-0 gap-5",
        detailOpen && "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
        className,
      )}
    >
      <section
        ref={listPanel}
        tabIndex={-1}
        aria-label={labels.list}
        className={cn(
          "split-view__list min-w-0",
          detailOpen && "hidden md:block",
        )}
      >
        {list}
      </section>
      {detailOpen && (
        <section
          ref={panel}
          tabIndex={-1}
          aria-label={labels.detail}
          className="split-view__detail min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring md:border-s md:ps-5"
        >
          <header className="split-view__detail-header mb-4 flex items-start gap-3 border-b pb-3">
            <button
              type="button"
              title={labels.close}
              aria-label={labels.close}
              onClick={onClose}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border bg-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <h2 className="split-view__detail-title min-w-0 break-words text-lg font-semibold">
              {detailTitle}
            </h2>
          </header>
          {detail}
        </section>
      )}
    </div>
  );
}
