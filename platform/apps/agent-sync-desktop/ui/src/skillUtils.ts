import { sortAndFilter, statusRank } from "./lib/catalogUtils";
import { pickPreferred } from "./lib/utils";
import type { SkillRecord } from "./types";

export function pickSelectedSkillKey(
  skills: SkillRecord[],
  preferredKey?: string | null,
  previousKey?: string | null,
): string | null {
  return pickPreferred(skills, preferredKey, previousKey, (s) => s.skill_key);
}

function skillComparator(starredSkillIds: string[]) {
  const starred = new Set(starredSkillIds);
  const starredRank = (id: string) => (starred.has(id) ? 0 : 1);
  const scopeRank = (scope: SkillRecord["scope"]) =>
    scope === "global" ? 0 : 1;

  return (lhs: SkillRecord, rhs: SkillRecord) =>
    statusRank(lhs.status) - statusRank(rhs.status) ||
    starredRank(lhs.id) - starredRank(rhs.id) ||
    scopeRank(lhs.scope) - scopeRank(rhs.scope) ||
    lhs.name.localeCompare(rhs.name);
}

const skillSearchFields = (skill: SkillRecord) => [
  skill.name,
  skill.skill_key,
  skill.scope,
  skill.workspace ?? "",
];

export function sortAndFilterSkills(
  skills: SkillRecord[],
  query: string,
  starredSkillIds: string[] = [],
): SkillRecord[] {
  return sortAndFilter(
    skills,
    query,
    skillComparator(starredSkillIds),
    skillSearchFields,
  );
}
