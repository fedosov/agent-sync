import { getSubagentDetails } from "../tauriApi";
import type { SubagentDetails } from "../types";
import { useEntityDetails } from "./useEntityDetails";

type UseSubagentDetailsOptions = {
  selectedSubagentId: string | null;
  onError: (message: string) => void;
};

type UseSubagentDetailsResult = {
  subagentDetails: SubagentDetails | null;
};

export function useSubagentDetails({
  selectedSubagentId,
  onError,
}: UseSubagentDetailsOptions): UseSubagentDetailsResult {
  const subagentDetails = useEntityDetails(
    selectedSubagentId,
    getSubagentDetails,
    onError,
  );

  return { subagentDetails };
}
