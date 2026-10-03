import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EntityDetailPanel, selectEntityDetailTabs } from '../dist/index.js';

const tabs = [
  { entityType: 'region.province', key: 'overview', label: 'Overview', order: 10, render: entity => entity.name },
  { entityType: 'other.record', key: 'overview', label: 'Other', order: 1, render: () => 'WRONG ENTITY' },
];
const props = { entityType: 'region.province', tabs, value: 'overview', onValueChange: () => {}, labels: { loading: 'Loading', error: 'Failed', retry: 'Retry', empty: 'Empty', navigation: 'Sections' } };
test('detail tabs are scoped by entity type and collision checks stay in that scope', () => {
  assert.equal(selectEntityDetailTabs('region.province', tabs).length, 1);
  assert.throws(() => selectEntityDetailTabs('region.province', [...tabs, tabs[0]]));
  assert.deepEqual(selectEntityDetailTabs('missing.record', tabs), []);
});
test('detail loading and error do not mount cached content or ready-only actions', () => {
  for (const state of [{ status: 'loading' }, { status: 'error', onRetry: () => {} }]) {
    const html = renderToStaticMarkup(createElement(EntityDetailPanel, { ...props, state, actions: 'EDIT' }));
    assert.doesNotMatch(html, /EDIT|WRONG ENTITY/);
    assert.match(html, state.status === 'loading' ? /role="status"/ : /role="alert"/);
  }
});
test('ready detail composes scoped controlled tabs and entity data', () => {
  const html = renderToStaticMarkup(createElement(EntityDetailPanel, { ...props, state: { status: 'ready', entity: { name: 'Aceh' } }, actions: 'EDIT' }));
  assert.match(html, /Aceh/); assert.match(html, /EDIT/); assert.doesNotMatch(html, /WRONG ENTITY/);
});
