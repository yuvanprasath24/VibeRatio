"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { ImageHit, Provider } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/providers/types";

interface ImageCardProps {
  hit: ImageHit;
  isInBasket: boolean;
  onPick: (hit: ImageHit) => void;
  onAddToBasket: (hit: ImageHit) => void;
  onRemoveFromBasket?: (hit: ImageHit) => void;
}

function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <span
      className="rounded-full bg-white/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-zinc-900 border border-black/10 shadow-sm"
    >
      {PROVIDERS[provider].label}
    </span>
  );
}

export function ImageCard({
  hit,
  isInBasket,
  onPick,
  onAddToBasket,
  onRemoveFromBasket,
}: ImageCardProps) {
  function handleBasketToggle(e: MouseEvent) {
    e.stopPropagation();
    if (isInBasket && onRemoveFromBasket) {
      onRemoveFromBasket(hit);
    } else {
      onAddToBasket(hit);
    }
  }

  return (
    <div className="group relative w-full mb-4 sm:mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-border-soft/50 bg-white shadow-md shadow-black/5 transition-all duration-300 ease-out hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 hover:ring-2 hover:ring-accent/25">
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
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
        />
      </button>

      <button
        type="button"
        onClick={handleBasketToggle}
        aria-label={isInBasket ? "Remove from basket" : "Add to basket"}
        className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition duration-200 ${
          isInBasket
            ? "bg-accent text-white shadow-md opacity-100"
            : "bg-white/80 text-zinc-800 opacity-0 group-hover:opacity-100 hover:bg-white border border-black/10"
        }`}
      >
        {isInBasket ? (
          <Check className="h-5 w-5" />
        ) : (
          <ShoppingBag className="h-5 w-5" />
        )}
      </button>

      <div className="absolute bottom-2.5 left-2.5">
        <ProviderBadge provider={hit.provider} />
      </div>
    </div>
  );
}
