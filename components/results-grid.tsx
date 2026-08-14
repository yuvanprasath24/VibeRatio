"use client";

import type { ImageHit } from "@/lib/providers/types";
import { ImageCard } from "@/components/image-card";

interface ResultsGridProps {
  hits: ImageHit[];
  isFavorite: (hit: ImageHit) => boolean;
  onPick: (hit: ImageHit) => void;
  onToggleFavorite: (hit: ImageHit) => void;
}

export function ResultsGrid({
  hits,
  isFavorite,
  onPick,
  onToggleFavorite,
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
          isFavorite={isFavorite(hit)}
          onPick={onPick}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}