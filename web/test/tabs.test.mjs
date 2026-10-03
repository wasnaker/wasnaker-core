import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTabPanelRegistry, TabsWorkspace } from "../dist/index.js";

test("panel registries are isolated and retain replacement registration", () => {
  const profile = createTabPanelRegistry();
  const settings = createTabPanelRegistry();
  const first = () => null;
  const replacement = () => null;
  profile.register(" region ", first);
  assert.equal(profile.get("region"), first);
  assert.equal(settings.get("region"), undefined);
  profile.register("region", replacement);
  assert.equal(profile.get("region"), replacement);
  for (const key of ["", "Region", "region/settings", "invalid key"]) {
    assert.throws(() => profile.register(key, first), /slug key/);
  }
});

const tabs = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
];

function render(overrides = {}) {
  return renderToStaticMarkup(
    createElement(TabsWorkspace, {
      tabs,
      value: "profile",
      onValueChange: () => {},
      navigationLabel: "Account sections",
      renderPanel: (tab) => `Content ${tab.key}`,
      ...overrides,
    }),
  );
}

test("tabs use ARIA pairs, semantic hooks, and only mount the active content", () => {
  const html = render({ classPrefix: "profile-page" });
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /aria-controls=/);
  assert.match(html, /aria-labelledby=/);
  assert.match(html, /profile-page__tab--active/);
  assert.match(html, /Content profile/);
  assert.doesNotMatch(html, /Content security/);
});

test("a missing active key falls back to the first tab", () => {
  assert.match(render({ value: "removed" }), /Content profile/);
});

test("controlled selection mounts only the selected panel", () => {
  const html = render({ value: "security" });
  assert.match(html, /Content security/);
  assert.doesNotMatch(html, /Content profile/);
});

test("two workspaces in the same tree generate distinct tab IDs", () => {
  const props = {
    tabs,
    value: "profile",
    onValueChange: () => {},
    navigationLabel: "Sections",
    renderPanel: () => "Content",
  };
  const html = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(TabsWorkspace, props),
      createElement(TabsWorkspace, props),
    ),
  );
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(ids.length > 0);
  assert.equal(new Set(ids).size, ids.length);
});

test("empty tabs have no orphan tabpanel or tablist", () => {
  const html = render({ tabs: [], emptyState: "No sections" });
  assert.match(html, /No sections/);
  assert.doesNotMatch(html, /role="tab/);
});

test("the same primitive supports horizontal tabs and translated labels", () => {
  const html = render({
    orientation: "horizontal",
    getLabel: (tab) => `Translated ${tab.label}`,
  });
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /Translated Profile/);
});
