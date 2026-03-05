import { useEffect, useState } from "react";
import { getSkillDetails } from "../tauriApi";
import type { SkillDetails } from "../types";
import { useEntityDetails } from "./useEntityDetails";

type UseSkillDetailsOptions = {
  selectedSkillKey: string | null;
  onError: (message: string) => void;
};

type UseSkillDetailsResult = {
  details: SkillDetails | null;
  renameDraft: string;
  setRenameDraft: (value: string | ((prev: string) => string)) => void;
};

export function useSkillDetails({
  selectedSkillKey,
  onError,
}: UseSkillDetailsOptions): UseSkillDetailsResult {
  const details = useEntityDetails(selectedSkillKey, getSkillDetails, onError);
  const [renameDraft, setRenameDraft] = useState("");

  useEffect(() => {
    const next = details?.skill.name ?? "";
    queueMicrotask(() => setRenameDraft(next));
  }, [details?.skill.name, details?.skill.skill_key]);

  return {
    details,
    renameDraft,
    setRenameDraft,
  };
}
