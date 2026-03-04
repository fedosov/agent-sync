import type { McpEnabledByAgent, McpServerRecord } from "../types";

export type McpAgentId = "codex" | "claude";

const VISIBLE_MCP_AGENTS: McpAgentId[] = ["codex", "claude"];

export function getVisibleMcpAgents(
  scope: McpServerRecord["scope"],
): McpAgentId[] {
  void scope;
  return VISIBLE_MCP_AGENTS;
}

export function splitMcpAgentsByEnabled(
  scope: McpServerRecord["scope"],
  enabledByAgent: McpEnabledByAgent,
): {
  enabledAgents: McpAgentId[];
  disabledAgents: McpAgentId[];
} {
  const visibleAgents = getVisibleMcpAgents(scope);
  const enabledAgents = visibleAgents.filter((agent) => enabledByAgent[agent]);
  const disabledAgents = visibleAgents.filter(
    (agent) => !enabledByAgent[agent],
  );

  return { enabledAgents, disabledAgents };
}
