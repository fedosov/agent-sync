import { useMemo } from "react";
import { mcpStatus, subagentStatus } from "../lib/catalogUtils";
import type {
  AgentsContextReport,
  FocusKind,
  McpServerRecord,
  SkillRecord,
  SubagentRecord,
  SyncState,
} from "../types";

type CatalogTabCounts = Record<FocusKind, number>;
type CatalogMeta = Record<FocusKind, { title: string; emptyText: string }>;

const CATALOG_META: CatalogMeta = {
  skills: { title: "Skills", emptyText: "No skills found." },
  subagents: { title: "Subagents", emptyText: "No subagents found." },
  mcp: { title: "MCP", emptyText: "No MCP servers found." },
  agents: { title: "Agents.md", emptyText: "No AGENTS.md entries found." },
};

type UseCatalogCountsParams = {
  state: SyncState | null;
  subagents: SubagentRecord[];
  agentsReport: AgentsContextReport | null;
  focusKind: FocusKind;
  filteredSkills: SkillRecord[];
  filteredSubagents: SubagentRecord[];
  filteredMcpServers: McpServerRecord[];
  filteredAgentEntries: import("../types").AgentContextEntry[];
};

type UseCatalogCountsResult = {
  activeSkillCount: number;
  archivedSkillCount: number;
  activeSubagentCount: number;
  archivedSubagentCount: number;
  activeMcpCount: number;
  archivedMcpCount: number;
  agentContextCount: number;
  catalogTabCounts: CatalogTabCounts;
  activeCatalogTitle: string;
  activeCatalogEmptyText: string;
  catalogFilteredCounts: CatalogTabCounts;
  activeCatalogCount: number;
  activeCatalogTotal: number;
};

export function useCatalogCounts({
  state,
  subagents,
  agentsReport,
  focusKind,
  filteredSkills,
  filteredSubagents,
  filteredMcpServers,
  filteredAgentEntries,
}: UseCatalogCountsParams): UseCatalogCountsResult {
  return useMemo(() => {
    const skills = state?.skills ?? [];
    const mcpServers = state?.mcp_servers ?? [];

    const activeSkillCount = skills.filter(
      (skill) => skill.status === "active",
    ).length;
    const archivedSkillCount = skills.filter(
      (skill) => skill.status === "archived",
    ).length;

    const activeSubagentCount = subagents.filter(
      (subagent) => subagentStatus(subagent) === "active",
    ).length;
    const archivedSubagentCount = subagents.length - activeSubagentCount;

    const activeMcpCount = mcpServers.filter(
      (server) => mcpStatus(server) === "active",
    ).length;
    const archivedMcpCount = mcpServers.filter(
      (server) => mcpStatus(server) === "archived",
    ).length;

    const mcpCount = mcpServers.length || (state?.summary.mcp_count ?? 0);
    const agentContextCount = agentsReport?.entries.length ?? 0;

    const catalogTabCounts: CatalogTabCounts = {
      skills: skills.length,
      subagents: subagents.length,
      mcp: mcpCount,
      agents: agentContextCount,
    };

    const catalogFilteredCounts: CatalogTabCounts = {
      skills: filteredSkills.length,
      subagents: filteredSubagents.length,
      mcp: filteredMcpServers.length,
      agents: filteredAgentEntries.length,
    };

    return {
      activeSkillCount,
      archivedSkillCount,
      activeSubagentCount,
      archivedSubagentCount,
      activeMcpCount,
      archivedMcpCount,
      agentContextCount,
      catalogTabCounts,
      activeCatalogTitle: CATALOG_META[focusKind].title,
      activeCatalogEmptyText: CATALOG_META[focusKind].emptyText,
      catalogFilteredCounts,
      activeCatalogCount: catalogFilteredCounts[focusKind],
      activeCatalogTotal: catalogTabCounts[focusKind],
    };
  }, [
    state,
    subagents,
    agentsReport,
    focusKind,
    filteredSkills,
    filteredSubagents,
    filteredMcpServers,
    filteredAgentEntries,
  ]);
}
