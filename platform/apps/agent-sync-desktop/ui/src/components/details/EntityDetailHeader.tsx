import type { ReactNode } from "react";
import { StarIcon } from "../ui/StarIcon";
import { CardHeader, CardTitle } from "../ui/card";

type EntityDetailHeaderProps = {
  name: string;
  entityKey: string;
  entityLabel: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  actions: ReactNode;
};

export function EntityDetailHeader({
  name,
  entityKey,
  entityLabel,
  isFavorite,
  onToggleFavorite,
  actions,
}: EntityDetailHeaderProps) {
  return (
    <CardHeader className="border-b border-border/60 pb-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-1.5">
          <button
            type="button"
            aria-label={
              isFavorite ? `Unstar ${entityLabel}` : `Star ${entityLabel}`
            }
            className={
              isFavorite
                ? "mt-0.5 text-amber-400 hover:text-amber-500"
                : "mt-0.5 text-muted-foreground/50 hover:text-amber-400"
            }
            onClick={onToggleFavorite}
          >
            <StarIcon filled={isFavorite} className="h-4 w-4" />
          </button>
          <div>
            <CardTitle className="text-lg leading-tight">{name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{entityKey}</p>
          </div>
        </div>
        {actions}
      </div>
    </CardHeader>
  );
}
