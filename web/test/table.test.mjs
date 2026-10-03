import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DataTable,
  SplitView,
  createDataTableQuery,
  updateDataTableQuery,
} from "../dist/index.js";

const data = [
  { id: "a", name: "Alpha", value: 2 },
  { id: "b", name: "Beta", value: 1 },
  { id: "c", name: "Gamma", value: 3 },
];
const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value" },
];
const labels = {
  name: "Records",
  search: "Search",
  columns: "Columns",
  loading: "Loading",
  empty: "Empty",
  error: "Failed",
  retry: "Retry",
  actions: "Actions",
  openRow: "Open",
  firstPage: "First",
  previousPage: "Previous",
  nextPage: "Next",
  lastPage: "Last",
  pageSize: "Size",
  page: (page, pages, count) => `${page}/${pages}/${count}`,
};
function render(overrides = {}) {
  return renderToStaticMarkup(
    createElement(DataTable, {
      mode: "client",
      data,
      columns,
      getRowId: (row) => row.id,
      query: createDataTableQuery(2),
      onQueryChange: () => {},
      labels,
      ...overrides,
    }),
  );
}

test("search, sorting and page-size changes reset page index", () => {
  const query = {
    ...createDataTableQuery(2),
    pagination: { pageIndex: 2, pageSize: 2 },
  };
  for (const patch of [
    { search: "Alpha" },
    { sorting: [{ id: "name", desc: true }] },
    { pagination: { pageIndex: 2, pageSize: 3 } },
  ])
    assert.equal(updateDataTableQuery(query, patch).pagination.pageIndex, 0);
  assert.equal(
    updateDataTableQuery(query, { pagination: { pageIndex: 1, pageSize: 2 } })
      .pagination.pageIndex,
    1,
  );
  assert.equal(query.pagination.pageIndex, 2);
  for (const size of [0, -1, 1.2, NaN])
    assert.throws(() => createDataTableQuery(size), RangeError);
});
test("client table filters, sorts and pages the complete dataset", () => {
  assert.match(render(), /Alpha/);
  assert.doesNotMatch(render(), /Gamma/);
  const sorted = render({
    query: {
      ...createDataTableQuery(2),
      sorting: [{ id: "value", desc: true }],
    },
  });
  assert.match(sorted, /Gamma/);
  assert.doesNotMatch(sorted, /Beta/);
  assert.match(sorted, /aria-sort="descending"/);
  const filtered = render({
    query: { ...createDataTableQuery(2), search: "Beta" },
  });
  assert.match(filtered, /Beta/);
  assert.doesNotMatch(filtered, /Alpha/);
});
test("server table neither filters nor sorts nor slices its supplied page", () => {
  const html = render({
    mode: "server",
    rowCount: 100,
    query: {
      search: "absent",
      sorting: [{ id: "name", desc: true }],
      pagination: { pageIndex: 4, pageSize: 1 },
    },
  });
  assert.ok(html.indexOf("Alpha") < html.indexOf("Beta"));
  assert.ok(html.indexOf("Beta") < html.indexOf("Gamma"));
  assert.match(html, /5\/100\/100/);
  assert.throws(() => render({ mode: "server", rowCount: -1 }), RangeError);
});
test("visibility and selected row use stable identifiers", () => {
  const html = render({
    columnVisibility: { value: false },
    selectedId: "b",
    onRowActivate: () => {},
  });
  assert.doesNotMatch(html.match(/<thead[\s\S]*?<\/thead>/)[0], />Value</);
  assert.match(html, /data-state="selected"/);
  assert.match(html, /Open: b/);
});
test("empty, loading and error states are distinct", () => {
  assert.match(render({ data: [] }), /Empty/);
  assert.match(render({ loading: true }), /aria-busy="true"/);
  assert.match(render({ error: true }), /role="alert"/);
  assert.doesNotMatch(render({ loading: true }), /Alpha/);
});
test("grouped columns have one sticky action header spanning the header rows", () => {
  const html = render({
    columns: [{ id: "record", header: "Record", columns }],
    onRowActivate: () => {},
  });
  assert.equal(html.match(/data-table__actions-header/g).length, 1);
  assert.match(html, /rowSpan="2"/i);
  assert.match(html, /data-table__row-actions sticky end-0/);
});
test("SplitView renders one list and one optional detail", () => {
  const props = {
    list: "LIST",
    detail: "DETAIL",
    detailOpen: false,
    onClose: () => {},
    detailTitle: "Record",
    labels: { list: "List", detail: "Detail", close: "Back" },
  };
  const closed = renderToStaticMarkup(createElement(SplitView, props));
  assert.match(closed, /LIST/);
  assert.doesNotMatch(closed, /DETAIL/);
  const opened = renderToStaticMarkup(
    createElement(SplitView, { ...props, detailOpen: true }),
  );
  assert.equal(opened.match(/LIST/g).length, 1);
  assert.equal(opened.match(/DETAIL/g).length, 1);
  assert.match(opened, /hidden md:block/);
  assert.match(opened, /aria-label="Back"/);
});
