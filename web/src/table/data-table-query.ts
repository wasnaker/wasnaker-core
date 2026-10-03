import type { PaginationState, SortingState } from "@tanstack/react-table";

export type DataTableQuery = {
  search: string;
  sorting: SortingState;
  pagination: PaginationState;
};

export function createDataTableQuery(pageSize = 15): DataTableQuery {
  const query = {
    search: "",
    sorting: [],
    pagination: { pageIndex: 0, pageSize },
  };
  validateDataTableQuery(query);
  return query;
}
export function validateDataTableQuery(query: DataTableQuery): void {
  const { pageIndex, pageSize } = query.pagination;
  if (
    !Number.isInteger(pageIndex) ||
    pageIndex < 0 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1
  )
    throw new RangeError(
      "DataTable requires a nonnegative pageIndex and positive pageSize",
    );
}
export function updateDataTableQuery(
  query: DataTableQuery,
  patch: Partial<DataTableQuery>,
): DataTableQuery {
  const next = { ...query, ...patch };
  if (
    patch.search !== undefined ||
    patch.sorting !== undefined ||
    next.pagination.pageSize !== query.pagination.pageSize
  )
    next.pagination = { ...next.pagination, pageIndex: 0 };
  validateDataTableQuery(next);
  return next;
}
