"use client";

import type { ImageHit } from "@/lib/providers/types";
import { ImageCard } from "@/components/image-card";

interface ResultsGridProps {
  hits: ImageHit[];
  isInBasket: (hit: ImageHit) => boolean;
  onPick: (hit: ImageHit) => void;
  onAddToBasket: (hit: ImageHit) => void;
  onRemoveFromBasket?: (hit: ImageHit) => void;
}

export function ResultsGrid({
  hits,
  isInBasket,
  onPick,
  onAddToBasket,
  onRemoveFromBasket,
}: ResultsGridProps) {
  const seen = new Set<string>();
  const uniqueHits = hits.filter((hit) => {
    const key = `${hit.provider}-${hit.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="columns-2 gap-4 sm:columns-3 sm:gap-6 lg:columns-4">
      {uniqueHits.map((hit, i) => (
        <ImageCard
          key={`${hit.provider}-${hit.id}-${i}`}
          hit={hit}
          isInBasket={isInBasket(hit)}
          onPick={onPick}
          onAddToBasket={onAddToBasket}
          onRemoveFromBasket={onRemoveFromBasket}
        />
      ))}
    </div>
  );
}
