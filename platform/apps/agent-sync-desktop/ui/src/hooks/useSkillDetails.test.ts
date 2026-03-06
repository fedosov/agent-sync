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
  it("does not overwrite a local rename draft when detail sync is deferred", async () => {
    const queued: VoidFunction[] = [];
    const queueMicrotaskSpy = vi
      .spyOn(globalThis, "queueMicrotask")
      .mockImplementation((callback: VoidFunction) => {
        queued.push(callback);
      });

    vi.mocked(tauriApi.getSkillDetails).mockResolvedValueOnce(
      makeDetails("skill-a", "Remote Name"),
    );

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSkillDetails({ selectedSkillKey: "skill-a", onError }),
    );

    try {
      await waitFor(() => {
        expect(result.current.details?.skill.skill_key).toBe("skill-a");
      });

      act(() => {
        result.current.setRenameDraft("User Draft");
      });

      act(() => {
        for (const callback of queued.splice(0)) {
          callback();
        }
      });

      expect(result.current.renameDraft).toBe("User Draft");
    } finally {
      queueMicrotaskSpy.mockRestore();
    }
  });

  it("drops a local rename draft when revisiting the same skill", async () => {
    vi.mocked(tauriApi.getSkillDetails)
      .mockResolvedValueOnce(makeDetails("skill-a", "Original Name"))
      .mockResolvedValueOnce(makeDetails("skill-b", "Other Name"))
      .mockResolvedValueOnce(makeDetails("skill-a", "Original Name"));

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
      expect(result.current.renameDraft).toBe("Original Name");
    });

    act(() => {
      result.current.setRenameDraft("Local draft");
    });
    expect(result.current.renameDraft).toBe("Local draft");

    rerender({ selectedSkillKey: "skill-b" });

    await waitFor(() => {
      expect(result.current.details?.skill.skill_key).toBe("skill-b");
      expect(result.current.renameDraft).toBe("Other Name");
    });

    rerender({ selectedSkillKey: "skill-a" });

    await waitFor(() => {
      expect(result.current.details?.skill.skill_key).toBe("skill-a");
    });
    await waitFor(() => {
      expect(result.current.renameDraft).toBe("Original Name");
    });
  });

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
