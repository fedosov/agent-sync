import { cn } from "../../lib/utils";
import type { SubagentRecord } from "../../types";
import { ScopeMarker } from "./ScopeMarker";
import { ScopeGroupedCatalog } from "./ScopeGroupedCatalog";
import { StarIcon } from "../ui/StarIcon";

type SubagentListPanelProps = {
  subagents: SubagentRecord[];
  query: string;
  selectedSubagentId: string | null;
  favorites: Set<string>;
  emptyText: string;
  expandedProjectGroups: Record<string, boolean | undefined>;
  onSelect: (subagentId: string) => void;
  onToggleProjectGroup: (groupKey: string, currentExpanded: boolean) => void;
  onCloseMenus: () => void;
};

export function SubagentListPanel({
  subagents,
  query,
  selectedSubagentId,
  favorites,
  emptyText,
  expandedProjectGroups,
  onSelect,
  onToggleProjectGroup,
  onCloseMenus,
}: SubagentListPanelProps) {
  return (
    <ScopeGroupedCatalog
      items={subagents}
      query={query}
      emptyText={emptyText}
      expandedProjectGroups={expandedProjectGroups}
      getItemKey={(subagent) => subagent.id}
      getScope={(subagent) => subagent.scope}
      getWorkspace={(subagent) => subagent.workspace}
      isItemSelected={(subagent) => subagent.id === selectedSubagentId}
      onToggleProjectGroup={onToggleProjectGroup}
      renderItem={(subagent) => {
        const selected = subagent.id === selectedSubagentId;
        return (
          <button
            type="button"
            className={cn(
              "w-full rounded-md px-2.5 py-2 text-left transition-colors",
              selected ? "bg-accent/85 text-foreground" : "hover:bg-accent/55",
            )}
            onClick={() => {
              onSelect(subagent.id);
              onCloseMenus();
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1">
                {favorites.has(subagent.id) ? (
                  <StarIcon
                    filled
                    className="h-3 w-3 shrink-0 text-amber-400"
                  />
                ) : null}
                <span className="truncate text-sm font-medium">
                  {subagent.name}
                </span>
              </span>
              <ScopeMarker scope={subagent.scope} />
            </div>
            <p
              aria-hidden="true"
              className="mt-0.5 truncate text-[11px] text-muted-foreground"
            >
              {subagent.subagent_key}
            </p>
          </button>
        );
      }}
    />
  );
}
