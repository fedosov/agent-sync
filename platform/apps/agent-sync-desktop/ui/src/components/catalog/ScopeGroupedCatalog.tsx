import type { ReactNode } from "react";
import { buildScopeGroupedCatalogSections } from "./scopeGroupedCatalogUtils";
import { cn } from "../../lib/utils";

type ScopeGroupedCatalogProps<T> = {
  items: T[];
  query: string;
  emptyText: string;
  expandedProjectGroups: Record<string, boolean | undefined>;
  getItemKey: (item: T) => string;
  getScope: (item: T) => string;
  getWorkspace: (item: T) => string | null;
  isItemSelected?: (item: T) => boolean;
  onToggleProjectGroup: (groupKey: string, currentExpanded: boolean) => void;
  renderItem: (item: T) => ReactNode;
};

export function ScopeGroupedCatalog<T>({
  items,
  query,
  emptyText,
  expandedProjectGroups,
  getItemKey,
  getScope,
  getWorkspace,
  isItemSelected,
  onToggleProjectGroup,
  renderItem,
}: ScopeGroupedCatalogProps<T>) {
  const { globalItems, projectGroups, autoExpandedProjectGroupKeys } =
    buildScopeGroupedCatalogSections({
      items,
      query,
      getScope,
      getWorkspace,
      isItemSelected,
    });

  if (globalItems.length === 0 && projectGroups.length === 0) {
    return (
      <p className="rounded-md bg-muted/20 px-2 py-2 text-xs text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <section className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Global
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {globalItems.length}
          </span>
        </div>
        {globalItems.length > 0 ? (
          <ul className="space-y-0.5">
            {globalItems.map((item) => (
              <li key={getItemKey(item)}>{renderItem(item)}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {projectGroups.map((group) => {
        const userOverride = expandedProjectGroups[group.key];
        const expanded =
          userOverride !== undefined
            ? userOverride
            : autoExpandedProjectGroupKeys.has(group.key);

        return (
          <section key={group.key} className="space-y-1.5">
            <button
              type="button"
              aria-expanded={expanded ? "true" : "false"}
              className={cn(
                "w-full rounded-md border border-border/60 bg-muted/10 px-2.5 py-2 text-left transition-colors hover:bg-muted/20",
                expanded ? "border-border/80 bg-muted/15" : null,
              )}
              onClick={() => onToggleProjectGroup(group.key, !!expanded)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {group.label}
                  </span>
                  <span
                    className="block truncate text-[11px] text-muted-foreground"
                    title={group.workspace}
                  >
                    {group.workspaceLabel}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {expanded ? "Hide" : "Show"} · {group.items.length}
                </span>
              </div>
            </button>

            {expanded ? (
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={getItemKey(item)}>{renderItem(item)}</li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
