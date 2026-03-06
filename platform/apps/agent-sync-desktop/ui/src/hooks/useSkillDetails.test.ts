import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as tauriApi from "../tauriApi";
import type { SkillDetails, SkillRecord } from "../types";
import { useSkillDetails } from "./useSkillDetails";

vi.mock("../tauriApi", () => ({
  getSkillDetails: vi.fn(),
}));

function makeSkill(skillKey: string, name: string): SkillRecord {
  return {
    id: `id-${skillKey}`,
    name,
    scope: "global",
    workspace: null,
    canonical_source_path: `/tmp/${skillKey}`,
    target_paths: [],
    status: "active",
    package_type: "dir",
    skill_key: skillKey,
  };
}

function makeDetails(skillKey: string, name: string): SkillDetails {
  return {
    skill: makeSkill(skillKey, name),
    main_file_path: `/tmp/${skillKey}/SKILL.md`,
    main_file_exists: true,
    main_file_body_preview: null,
    skill_dir_tree_preview: null,
    last_modified_unix_seconds: null,
  };
}

describe("useSkillDetails", () => {
  it("resets rename draft when switching to another skill with the same name", async () => {
    vi.mocked(tauriApi.getSkillDetails)
      .mockResolvedValueOnce(makeDetails("skill-a", "Shared Name"))
      .mockResolvedValueOnce(makeDetails("skill-b", "Shared Name"));

    const onError = vi.fn();
    const { result, rerender } = renderHook(
      ({ selectedSkillKey }: { selectedSkillKey: string | null }) =>
        useSkillDetails({ selectedSkillKey, onError }),
      {
        initialProps: { selectedSkillKey: "skill-a" },
      },
    );

    await waitFor(() => {
      expect(result.current.details?.skill.skill_key).toBe("skill-a");
      expect(result.current.renameDraft).toBe("Shared Name");
    });

    act(() => {
      result.current.setRenameDraft("Local draft");
    });
    expect(result.current.renameDraft).toBe("Local draft");

    rerender({ selectedSkillKey: "skill-b" });

    await waitFor(() => {
      expect(result.current.details?.skill.skill_key).toBe("skill-b");
    });
    await waitFor(() => {
      expect(result.current.renameDraft).toBe("Shared Name");
    });
  });
});
