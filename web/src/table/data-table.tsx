"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  useReactTable,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type VisibilityState,
  type OnChangeFn,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Eye,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { cn } from "../lib/classnames.js";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table.js";
import {
  updateDataTableQuery,
  validateDataTableQuery,
  type DataTableQuery,
} from "./data-table-query.js";

export type DataTableLabels = {
  name: string;
  search: string;
  columns: string;
  loading: string;
  empty: string;
  error: string;
  retry: string;
  actions: string;
  openRow: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  pageSize: string;
  page: (page: number, pages: number, total: number) => string;
  column?: (id: string) => string;
};
type CommonProps<Data> = {
  data: Data[];
  columns: ColumnDef<Data>[];
  getRowId: (row: Data) => string;
  getRowLabel?: (row: Data) => string;
  query: DataTableQuery;
  onQueryChange: (query: DataTableQuery) => void;
  labels: DataTableLabels;
  selectedId?: string | null;
  onRowActivate?: (row: Data) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  toolbar?: ReactNode;
  renderRowActions?: (row: Data) => ReactNode;
  emptyState?: ReactNode;
  pageSizes?: readonly number[];
  className?: string;
};
export type DataTableProps<Data> = CommonProps<Data> &
  ({ mode: "client"; rowCount?: never } | { mode: "server"; rowCount: number });
const iconButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

export function DataTable<Data>(props: DataTableProps<Data>) {
  const {
    data,
    columns,
    getRowId,
    getRowLabel,
    query,
    onQueryChange,
    labels,
    selectedId,
    onRowActivate,
    loading = false,
    error = false,
    onRetry,
    toolbar,
    renderRowActions,
    emptyState,
    pageSizes = [15, 25, 50],
    className,
  } = props;
  validateDataTableQuery(query);
  if (
    props.mode === "server" &&
    (!Number.isInteger(props.rowCount) || props.rowCount < 0)
  )
    throw new RangeError("Server DataTable requires a nonnegative rowCount");
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const manual = props.mode === "server";
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting: query.sorting,
      globalFilter: query.search,
      pagination: query.pagination,
      columnVisibility: props.columnVisibility ?? visibility,
    },
    onSortingChange: (updater) =>
      onQueryChange(
        updateDataTableQuery(query, {
          sorting: functionalUpdate(updater, query.sorting),
        }),
      ),
    onPaginationChange: (updater) =>
      onQueryChange(
        updateDataTableQuery(query, {
          pagination: functionalUpdate(updater, query.pagination),
        }),
      ),
    onColumnVisibilityChange: props.onColumnVisibilityChange ?? setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
    getSortedRowModel: manual ? undefined : getSortedRowModel(),
    getPaginationRowModel: manual ? undefined : getPaginationRowModel(),
    globalFilterFn: "includesString",
    manualFiltering: manual,
    manualSorting: manual,
    manualPagination: manual,
    rowCount: props.mode === "server" ? props.rowCount : undefined,
    autoResetPageIndex: false,
    enableMultiSort: false,
  });
  const total =
    props.mode === "server"
      ? props.rowCount
      : table.getFilteredRowModel().rows.length;
  const pages = Math.max(1, Math.ceil(total / query.pagination.pageSize));
  useEffect(() => {
    if (!loading && !error && query.pagination.pageIndex >= pages)
      onQueryChange({
        ...query,
        pagination: { ...query.pagination, pageIndex: pages - 1 },
      });
  }, [pages, query, loading, error, onQueryChange]);
  const actions = Boolean(onRowActivate || renderRowActions);
  const visibleColumns = table.getVisibleLeafColumns();
  const rows = table.getRowModel().rows;
  const sizes = [...new Set([...pageSizes, query.pagination.pageSize])]
    .filter((size) => Number.isInteger(size) && size > 0)
    .sort((a, b) => a - b);
  const blocked = loading || error;
  return (
    <div className={cn("data-table min-w-0", className)} aria-busy={loading}>
      <div className="data-table__toolbar mb-3 flex flex-wrap items-center gap-2">
        <label className="data-table__search flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-3 sm:max-w-xs">
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label={labels.search}
            placeholder={labels.search}
            value={query.search}
            onChange={(event) =>
              onQueryChange(
                updateDataTableQuery(query, { search: event.target.value }),
              )
            }
            className="h-9 w-full min-w-0 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <details className="data-table__columns relative">
          <summary
            title={labels.columns}
            aria-label={labels.columns}
            className={cn(
              iconButtonClass,
              "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            <Columns3 className="size-4" aria-hidden="true" />
          </summary>
          <div className="absolute end-0 top-full z-20 mt-1 max-h-64 w-52 overflow-y-auto rounded-md border bg-background p-2 shadow-md">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <label
                  key={column.id}
                  className="data-table__column-option flex items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="mt-1 shrink-0 accent-primary"
                    checked={column.getIsVisible()}
                    disabled={
                      visibleColumns.length === 1 && column.getIsVisible()
                    }
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  <span className="min-w-0 break-words">
                    {labels.column?.(column.id) ??
                      (typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id)}
                  </span>
                </label>
              ))}
          </div>
        </details>
        {toolbar}
      </div>
      <Table aria-label={labels.name} className="data-table__table">
        <TableHeader className="data-table__header">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const SortIcon =
                  sorted === "asc"
                    ? ArrowUp
                    : sorted === "desc"
                      ? ArrowDown
                      : ArrowUpDown;
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : header.column.getCanSort()
                            ? "none"
                            : undefined
                    }
                    style={{
                      minWidth: header.column.columnDef.minSize,
                      width: header.getSize(),
                    }}
                  >
                    {!header.isPlaceholder &&
                      (header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex min-h-10 items-center gap-2 py-1 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          disabled={blocked}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIcon
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      ))}
                  </TableHead>
                );
              })}
              {actions && group.id === table.getHeaderGroups()[0]?.id && (
                <TableHead
                  rowSpan={table.getHeaderGroups().length}
                  className="data-table__actions-header sticky end-0 z-10 w-24 min-w-24 bg-background text-end"
                >
                  {labels.actions}
                </TableHead>
              )}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="data-table__body">
          {blocked || !rows.length ? (
            <TableRow>
              <TableCell
                colSpan={Math.max(1, visibleColumns.length + Number(actions))}
                className="h-48 text-center"
              >
                {loading ? (
                  <div
                    role="status"
                    className="inline-flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    {labels.loading}
                  </div>
                ) : error ? (
                  <div
                    role="alert"
                    className="flex flex-col items-center gap-3"
                  >
                    <p>{labels.error}</p>
                    {onRetry && (
                      <button
                        type="button"
                        className={iconButtonClass}
                        title={labels.retry}
                        aria-label={labels.retry}
                        onClick={onRetry}
                      >
                        <RotateCcw className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div role="status" className="text-muted-foreground">
                    {emptyState ?? labels.empty}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "data-table__row",
                  onRowActivate && "cursor-pointer",
                )}
                data-state={selectedId === row.id ? "selected" : undefined}
                onClick={
                  onRowActivate
                    ? (event) => {
                        if (
                          (event.target as Element).closest(
                            "button,a,input,select,textarea,summary,[role=button],[role=checkbox]",
                          )
                        )
                          return;
                        event.currentTarget
                          .querySelector<HTMLButtonElement>("[data-row-open]")
                          ?.focus();
                        onRowActivate(row.original);
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ minWidth: cell.column.columnDef.minSize }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    className={cn(
                      "data-table__row-actions sticky end-0 z-10 min-w-24 bg-background text-end",
                      selectedId === row.id && "bg-muted",
                    )}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {renderRowActions?.(row.original)}
                      {onRowActivate && (
                        <button
                          type="button"
                          data-row-open
                          title={labels.openRow}
                          aria-label={`${labels.openRow}: ${getRowLabel?.(row.original) ?? row.id}`}
                          className={iconButtonClass}
                          onClick={() => onRowActivate(row.original)}
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <footer className="data-table__pagination mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
        <div role="status" className="data-table__page-summary tabular-nums">
          {labels.page(
            Math.min(query.pagination.pageIndex + 1, pages),
            pages,
            total,
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            <span>{labels.pageSize}</span>
            <select
              aria-label={labels.pageSize}
              value={query.pagination.pageSize}
              disabled={blocked}
              onChange={(event) =>
                table.setPageSize(Number(event.target.value))
              }
              className="h-8 rounded-md border bg-background px-2 text-foreground"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            title={labels.firstPage}
            aria-label={labels.firstPage}
            className={iconButtonClass}
            disabled={blocked || !table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
          >
            <ChevronsLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            title={labels.previousPage}
            aria-label={labels.previousPage}
            className={iconButtonClass}
            disabled={blocked || !table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            title={labels.nextPage}
            aria-label={labels.nextPage}
            className={iconButtonClass}
            disabled={blocked || !table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            title={labels.lastPage}
            aria-label={labels.lastPage}
            className={iconButtonClass}
            disabled={blocked || !table.getCanNextPage()}
            onClick={() => table.setPageIndex(pages - 1)}
          >
            <ChevronsRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
