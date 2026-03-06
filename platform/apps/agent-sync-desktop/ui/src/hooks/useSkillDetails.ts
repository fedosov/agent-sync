import { useState } from "react";
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

type RenameDraftState = {
  details: SkillDetails | null;
  value: string;
};

export function useSkillDetails({
  selectedSkillKey,
  onError,
}: UseSkillDetailsOptions): UseSkillDetailsResult {
  const details = useEntityDetails(selectedSkillKey, getSkillDetails, onError);
  const [renameDraftState, setRenameDraftState] = useState<RenameDraftState>({
    details: null,
    value: "",
  });

  const detailName = details?.skill.name ?? "";
  const renameDraft =
    renameDraftState.details === details ? renameDraftState.value : detailName;

  function setRenameDraft(value: string | ((prev: string) => string)) {
    setRenameDraftState((previous) => {
      const currentValue =
        previous.details === details ? previous.value : detailName;
      return {
        details,
        value: typeof value === "function" ? value(currentValue) : value,
      };
    });
  }

  return {
    details,
    renameDraft,
    setRenameDraft,
  };
}
