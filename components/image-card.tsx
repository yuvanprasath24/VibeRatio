"use client";

import Image from "next/image";
import type { ImageHit, Provider } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/providers/types";

interface ImageCardProps {
  hit: ImageHit;
  isFavorite: boolean;
  onPick: (hit: ImageHit) => void;
  onToggleFavorite: (hit: ImageHit) => void;
}

function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <span
      className="rounded-full bg-black/40 backdrop-blur-md px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white/90 border border-white/15 shadow-sm"
    >
      {PROVIDERS[provider].label}
    </span>
  );
}

export function ImageCard({
  hit,
  isFavorite,
  onPick,
  onToggleFavorite,
}: ImageCardProps) {
  return (
    <div className="group relative w-full mb-4 sm:mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-border-soft/50 bg-surface/80 shadow-md shadow-black/30 transition duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      <button
        type="button"
        onClick={() => onPick(hit)}
        className="relative block w-full overflow-hidden"
        style={{ aspectRatio: `${hit.width} / ${hit.height}` }}
        aria-label={hit.alt || "Open wallpaper preview"}
      >
        <Image
          src={hit.thumb}
          alt={hit.alt || hit.author}
          fill
          priority={false}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        />
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(hit)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition duration-200 ${
          isFavorite
            ? "bg-accent text-black shadow-md opacity-100"
            : "bg-black/40 text-white/90 opacity-0 group-hover:opacity-100 hover:bg-black/70 border border-white/10"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M12 21s-7.5-4.7-9.4-9.3C1 8 3.4 4.5 7 4.5c2.2 0 3.8 1.2 5 2.6 1.2-1.4 2.8-2.6 5-2.6 3.6 0 6 3.5 4.4 7.2C19.5 16.3 12 21 12 21Z" />
        </svg>
      </button>

      <div className="absolute bottom-2.5 left-2.5">
        <ProviderBadge provider={hit.provider} />
      </div>
    </div>
  );
}