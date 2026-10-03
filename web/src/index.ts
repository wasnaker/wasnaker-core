"use client";

export { TabsWorkspace } from "./tabs/tabs-workspace.js";
export type {
  WorkspaceTab,
  TabsWorkspaceProps,
} from "./tabs/tabs-workspace.js";
export { createTabPanelRegistry } from "./tabs/tab-panel-registry.js";
export { DataTable } from "./table/data-table.js";
export type { DataTableProps, DataTableLabels } from "./table/data-table.js";
export {
  createDataTableQuery,
  updateDataTableQuery,
} from "./table/data-table-query.js";
export type { DataTableQuery } from "./table/data-table-query.js";
export type { ColumnDef, VisibilityState } from "@tanstack/react-table";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table/table.js";
export { SplitView } from "./layout/split-view.js";
export type { SplitViewProps } from "./layout/split-view.js";
export {
  EntityDetailPanel,
  selectEntityDetailTabs,
} from "./detail/entity-detail-panel.js";
export type {
  EntityDetailPanelProps,
  EntityDetailState,
  EntityDetailTab,
} from "./detail/entity-detail-panel.js";
