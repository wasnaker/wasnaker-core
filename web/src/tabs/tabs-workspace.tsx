"use client";

import type { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";

export type WorkspaceTab = {
  key: string;
  label: string;
};

export type TabsWorkspaceProps<Tab extends WorkspaceTab> = {
  tabs: readonly Tab[];
  value: string;
  onValueChange: (key: string) => void;
  navigationLabel: string;
  renderPanel: (tab: Tab) => ReactNode;
  getLabel?: (tab: Tab) => ReactNode;
  orientation?: "vertical" | "horizontal";
  classPrefix?: string;
  emptyState?: ReactNode;
};

export function TabsWorkspace<Tab extends WorkspaceTab>({
  tabs,
  value,
  onValueChange,
  navigationLabel,
  renderPanel,
  getLabel = (tab) => tab.label,
  orientation = "vertical",
  classPrefix = "tabs-workspace",
  emptyState = null,
}: TabsWorkspaceProps<Tab>) {
  const activeTab = tabs.find((tab) => tab.key === value) ?? tabs[0];
  if (!activeTab) {
    return <div className={`${classPrefix}__empty`}>{emptyState}</div>;
  }

  const vertical = orientation === "vertical";

  return (
    <Tabs.Root
      value={activeTab.key}
      onValueChange={onValueChange}
      orientation={orientation}
      activationMode="automatic"
      className={`tabs-workspace ${classPrefix}__layout grid min-w-0 gap-6 pt-5 ${
        vertical ? "md:grid-cols-[220px_minmax(0,1fr)]" : "grid-cols-1"
      }`}
    >
      <nav
        aria-label={navigationLabel}
        className={`tabs-workspace__navigation ${classPrefix}__navigation min-w-0`}
      >
        <Tabs.List
          aria-label={navigationLabel}
          className={`tabs-workspace__tabs ${classPrefix}__tabs flex gap-1 ${
            vertical ? "flex-col" : "flex-wrap"
          }`}
        >
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.key}
              value={tab.key}
              className={`tabs-workspace__tab ${classPrefix}__tab min-w-0 break-words px-3 py-2 text-start text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                vertical ? "w-full border-s-2" : "border-b-2"
              } ${
                activeTab.key === tab.key
                  ? `${classPrefix}__tab--active border-primary bg-muted/50 text-foreground`
                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              {getLabel(tab)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </nav>

      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.key}
          value={tab.key}
          className={`tabs-workspace__panel ${classPrefix}__panel min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {tab.key === activeTab.key && (
            <>
              <h2
                className={`${classPrefix}__panel-title border-b pb-3 text-lg font-semibold break-words`}
              >
                {getLabel(tab)}
              </h2>
              {renderPanel(tab)}
            </>
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
