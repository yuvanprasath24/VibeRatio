"use client";

import { useState } from "react";
import Link from "next/link";
import type { ImageHit } from "@/lib/providers/types";
import { useAppState } from "@/components/app-state";
import { ResultsGrid } from "@/components/results-grid";
import { Lightbox } from "@/components/lightbox";
import { MobileHeader } from "@/components/sidebar";

export default function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite } = useAppState();
  const [picked, setPicked] = useState<ImageHit | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <MobileHeader />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-3xl">
                Favorites
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                {favorites.length} saved{" "}
                {favorites.length === 1 ? "wallpaper" : "wallpapers"} — stored
                privately in your browser.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-border-soft/80 bg-surface/80 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-300 transition duration-200 hover:border-accent/60 hover:text-foreground hover:bg-surface-2"
            >
              New search
            </Link>
          </div>

          {favorites.length === 0 ? (
            <div className="rounded-3xl border border-border-soft/60 bg-surface/60 backdrop-blur-xl p-12 text-center shadow-xl shadow-black/30">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7.5-4.7-9.4-9.3C1 8 3.4 4.5 7 4.5c2.2 0 3.8 1.2 5 2.6 1.2-1.4 2.8-2.6 5-2.6 3.6 0 6 3.5 4.4 7.2C19.5 16.3 12 21 12 21Z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                Your collection is empty. Click the heart icon on any wallpaper to save it here.
              </p>
              <Link
                href="/"
                className="mt-5 inline-block rounded-full bg-gradient-to-r from-accent to-accent-cyan px-6 py-2.5 text-xs font-semibold text-black shadow-lg shadow-accent/20 hover:brightness-110"
              >
                Explore Wallpapers
              </Link>
            </div>
          ) : (
            <ResultsGrid
              hits={favorites}
              isFavorite={isFavorite}
              onPick={setPicked}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      </div>

      <Lightbox
        hit={picked}
        onClose={() => setPicked(null)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}