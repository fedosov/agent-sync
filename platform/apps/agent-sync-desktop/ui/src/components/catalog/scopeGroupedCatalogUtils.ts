import { compactPath } from "../../lib/formatting";

export type ScopeGroupedCatalogProjectGroup<T> = {
  key: string;
  label: string;
  workspace: string;
  workspaceLabel: string;
  items: T[];
};

export type ScopeGroupedCatalogSections<T> = {
  globalItems: T[];
  projectGroups: ScopeGroupedCatalogProjectGroup<T>[];
  autoExpandedProjectGroupKeys: Set<string>;
};

type BuildScopeGroupedCatalogOptions<T> = {
  items: T[];
  query: string;
  getScope: (item: T) => string;
  getWorkspace: (item: T) => string | null;
  isItemSelected?: (item: T) => boolean;
};

function workspaceBasename(workspace: string): string {
  const normalized = workspace.replace(/\/+$/, "");
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? workspace;
}

export function buildScopeGroupedCatalogSections<T>({
  items,
  query,
  getScope,
  getWorkspace,
  isItemSelected,
}: BuildScopeGroupedCatalogOptions<T>): ScopeGroupedCatalogSections<T> {
  const globalItems: T[] = [];
  const projectGroups: ScopeGroupedCatalogProjectGroup<T>[] = [];
  const projectGroupMap = new Map<string, ScopeGroupedCatalogProjectGroup<T>>();
  const autoExpandedProjectGroupKeys = new Set<string>();
  const hasActiveQuery = query.trim().length > 0;

  for (const item of items) {
    if (getScope(item) !== "project") {
      globalItems.push(item);
      continue;
    }

    const workspace = getWorkspace(item) ?? "unknown workspace";
    let group = projectGroupMap.get(workspace);
    if (!group) {
      group = {
        key: workspace,
        label: workspaceBasename(workspace),
        workspace,
        workspaceLabel: compactPath(workspace),
        items: [],
      };
      projectGroupMap.set(workspace, group);
      projectGroups.push(group);
    }

    group.items.push(item);

    if (hasActiveQuery || isItemSelected?.(item)) {
      autoExpandedProjectGroupKeys.add(group.key);
    }
  }

  return {
    globalItems,
    projectGroups,
    autoExpandedProjectGroupKeys,
  };
}
