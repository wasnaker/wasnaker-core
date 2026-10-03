import type { ComponentType } from "react";

export function createTabPanelRegistry<Props extends object = object>() {
  const panels = new Map<string, ComponentType<Props>>();

  return {
    register(key: string, panel: ComponentType<Props>): void {
      const normalizedKey = key.trim();
      if (!/^[a-z0-9][a-z0-9_-]*$/.test(normalizedKey)) {
        throw new Error("Tab panels require a slug key");
      }
      panels.set(normalizedKey, panel);
    },
    get(key: string): ComponentType<Props> | undefined {
      return panels.get(key);
    },
  };
}
