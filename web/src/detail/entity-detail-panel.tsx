"use client";

import type { ReactNode } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { TabsWorkspace, type WorkspaceTab } from "../tabs/tabs-workspace.js";
import { cn } from "../lib/classnames.js";

export type EntityDetailTab<Entity> = WorkspaceTab & {
  entityType: string;
  order: number;
  render: (entity: Entity) => ReactNode;
};
export type EntityDetailState<Entity> =
  | { status: "loading" }
  | { status: "error"; onRetry?: () => void }
  | { status: "ready"; entity: Entity };
export type EntityDetailPanelProps<Entity> = {
  entityType: string;
  state: EntityDetailState<Entity>;
  tabs: readonly EntityDetailTab<Entity>[];
  value: string;
  onValueChange: (key: string) => void;
  actions?: ReactNode;
  labels: {
    loading: string;
    error: string;
    retry: string;
    empty: string;
    navigation: string;
  };
  className?: string;
};
export function selectEntityDetailTabs<Entity>(
  entityType: string,
  tabs: readonly EntityDetailTab<Entity>[],
) {
  const selected = tabs.filter((tab) => tab.entityType === entityType);
  const keys = new Set<string>();
  for (const tab of selected) {
    if (
      !/^[a-z0-9][a-z0-9_-]*$/.test(tab.key) ||
      keys.has(tab.key) ||
      !Number.isFinite(tab.order)
    )
      throw new Error(
        "Detail tabs require unique slug keys and finite order within their entity type",
      );
    keys.add(tab.key);
  }
  return [...selected].sort(
    (left, right) =>
      left.order - right.order || left.key.localeCompare(right.key),
  );
}
export function EntityDetailPanel<Entity>({
  entityType,
  state,
  tabs,
  value,
  onValueChange,
  actions,
  labels,
  className,
}: EntityDetailPanelProps<Entity>) {
  const scopedTabs = selectEntityDetailTabs(entityType, tabs);
  return (
    <div
      className={cn("entity-detail-panel min-w-0", className)}
      aria-busy={state.status === "loading"}
    >
      {state.status === "loading" ? (
        <div
          role="status"
          className="entity-detail-panel__loading flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {labels.loading}
        </div>
      ) : state.status === "error" ? (
        <div
          role="alert"
          className="entity-detail-panel__error flex min-h-32 flex-col items-center justify-center gap-3 text-sm"
        >
          <p>{labels.error}</p>
          {state.onRetry && (
            <button
              type="button"
              onClick={state.onRetry}
              title={labels.retry}
              aria-label={labels.retry}
              className="inline-flex size-8 items-center justify-center rounded-md border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <>
          {actions && (
            <div className="entity-detail-panel__actions flex flex-wrap justify-end gap-2">
              {actions}
            </div>
          )}
          <TabsWorkspace
            tabs={scopedTabs}
            value={value}
            onValueChange={onValueChange}
            orientation="horizontal"
            navigationLabel={labels.navigation}
            classPrefix="entity-detail-panel"
            emptyState={
              <p className="py-5 text-sm text-muted-foreground">
                {labels.empty}
              </p>
            }
            renderPanel={(tab) => tab.render(state.entity)}
          />
        </>
      )}
    </div>
  );
}
