import { compactPath } from "../../lib/formatting";
import { cn } from "../../lib/utils";
import type { AgentContextEntry } from "../../types";
import { severityDotClass } from "../../lib/catalogUtils";
import { ScopeGroupedCatalog } from "./ScopeGroupedCatalog";
import { StarIcon } from "../ui/StarIcon";

type AgentsListPanelProps = {
  entries: AgentContextEntry[];
  query: string;
  selectedAgentEntryId: string | null;
  favorites: Set<string>;
  emptyText: string;
  expandedProjectGroups: Record<string, boolean | undefined>;
  onSelect: (entryId: string) => void;
  onToggleProjectGroup: (groupKey: string, currentExpanded: boolean) => void;
  onCloseMenus: () => void;
};

export function AgentsListPanel({
  entries,
  query,
  selectedAgentEntryId,
  favorites,
  emptyText,
  expandedProjectGroups,
  onSelect,
  onToggleProjectGroup,
  onCloseMenus,
}: AgentsListPanelProps) {
  return (
    <ScopeGroupedCatalog
      items={entries}
      query={query}
      emptyText={emptyText}
      expandedProjectGroups={expandedProjectGroups}
      getItemKey={(entry) => entry.id}
      getScope={(entry) => entry.scope}
      getWorkspace={(entry) => entry.workspace}
      isItemSelected={(entry) => entry.id === selectedAgentEntryId}
      onToggleProjectGroup={onToggleProjectGroup}
      renderItem={(entry) => {
        const selected = entry.id === selectedAgentEntryId;
        return (
          <button
            type="button"
            className={cn(
              "w-full rounded-md px-2.5 py-2 text-left transition-colors",
              selected ? "bg-accent/85 text-foreground" : "hover:bg-accent/55",
            )}
            onClick={() => {
              onSelect(entry.id);
              onCloseMenus();
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {favorites.has(entry.id) ? (
                  <StarIcon
                    filled
                    className="h-3 w-3 shrink-0 text-amber-400"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={severityDotClass(entry.severity)}
                />
                <span className="truncate text-sm font-medium">
                  {entry.scope === "global"
                    ? "Global AGENTS.md"
                    : "Project AGENTS.md"}
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {entry.severity}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {compactPath(entry.root_path)}
            </p>
          </button>
        );
      }}
    />
  );
}
