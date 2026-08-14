"use client";

import type { ImageHit, Provider } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/providers/types";
import { ResultsGrid } from "@/components/results-grid";
import { SkeletonGrid } from "@/components/skeleton";

export interface Turn {
  id: string;
  query: string;
  provider: Provider | "auto";
  orientation?: "all" | "landscape" | "portrait";
  status: "loading" | "done" | "error";
  page: number;
  perPage: number;
  hits: ImageHit[];
  total: number;
  hasMore: boolean;
  loadingMore?: boolean;
  error?: string;
}

interface TurnProps {
  turn: Turn;
  onRemove: (id: string) => void;
  onRetry: (turn: Turn) => void;
  onLoadMore: (turn: Turn) => void;
  onPick: (hit: ImageHit) => void;
  isFavorite: (hit: ImageHit) => boolean;
  onToggleFavorite: (hit: ImageHit) => void;
}

export function Turn({
  turn,
  onRemove,
  onRetry,
  onLoadMore,
  onPick,
  isFavorite,
  onToggleFavorite,
}: TurnProps) {
  return (
    <section aria-label={`Search: ${turn.query}`}>
      <div className="group flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/20 text-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="pt-1 text-sm font-medium leading-snug text-foreground">
            {turn.query}
          </p>

          {turn.status === "done" && (
            <p className="mt-1 text-xs text-zinc-500">
              {turn.total} result{turn.total === 1 ? "" : "s"} from{" "}
              {turn.provider === "auto"
                ? "Auto"
                : PROVIDERS[turn.provider].label}
              {turn.page > 1 ? ` · page ${turn.page}` : ""}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(turn.id)}
          aria-label="Remove search"
          className="mt-1 hidden shrink-0 rounded-md p-1 text-zinc-600 hover:bg-surface-2 hover:text-foreground group-hover:block"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        {turn.status === "loading" ? (
          <SkeletonGrid count={9} />
        ) : turn.status === "error" ? (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">
              {turn.error || "Something went wrong."}
            </p>
            <button
              type="button"
              onClick={() => onRetry(turn)}
              className="mt-3 rounded-full border border-border-soft px-3 py-1.5 text-xs text-zinc-300 hover:bg-surface-2"
            >
              Try again
            </button>
          </div>
        ) : turn.hits.length === 0 ? (
          <p className="rounded-xl border border-border-soft bg-surface p-4 text-sm text-zinc-400">
            No wallpapers found for “{turn.query}”. Try a different keyword.
          </p>
        ) : (
          <>
            <ResultsGrid
              hits={turn.hits}
              isFavorite={isFavorite}
              onPick={onPick}
              onToggleFavorite={onToggleFavorite}
            />
            {turn.hasMore && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => onLoadMore(turn)}
                  disabled={turn.loadingMore}
                  className="rounded-full border border-border-soft bg-surface px-5 py-2 text-sm text-zinc-300 transition hover:border-accent/50 hover:text-foreground disabled:opacity-50"
                >
                  {turn.loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}