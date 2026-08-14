"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageHit, Provider, SearchResult } from "@/lib/providers/types";
import { useAppState } from "@/components/app-state";
import { Composer } from "@/components/composer";
import { Turn, type Turn as TurnRecord } from "@/components/turn";
import { Lightbox } from "@/components/lightbox";

import { MobileHeader } from "@/components/sidebar";

const PER_PAGE = 24;

function turnId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function AmbientCursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-0 h-96 w-96 rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-blue-500/10 blur-3xl transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x - 192}px, ${pos.y - 192}px, 0)`,
      }}
    />
  );
}

export default function HomePage() {
  const { addHistory, isFavorite, toggleFavorite } = useAppState();
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [picked, setPicked] = useState<ImageHit | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = turns.some((t) => t.status === "loading");

  const fetchSearch = useCallback(
    async (
      q: string,
      provider: Provider | "auto",
      page: number,
      orientation: "all" | "landscape" | "portrait" = "all",
    ): Promise<SearchResult> => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&provider=${provider}&page=${page}&per_page=${PER_PAGE}&orientation=${orientation}`,
      );
      if (!res.ok) {
        let message = "Search failed";
        try {
          const body = (await res.json()) as { error?: string };
          message = body.error ?? message;
        } catch {
          // keep default message
        }
        throw new Error(message);
      }
      return (await res.json()) as SearchResult;
    },
    [],
  );

  const submit = useCallback(
    (
      raw: string,
      provider: Provider | "auto" = "auto",
      orientation: "all" | "landscape" | "portrait" = "all",
    ) => {
      const q = raw.trim();
      if (!q || busy) return;
      addHistory(q);
      const id = turnId();
      setTurns((prev) => [
        ...prev,
        {
          id,
          query: q,
          provider,
          orientation,
          status: "loading",
          page: 1,
          perPage: PER_PAGE,
          hits: [],
          total: 0,
          hasMore: false,
        },
      ]);
      fetchSearch(q, provider, 1, orientation)
        .then((result) =>
          setTurns((prev) =>
            prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    provider: result.provider,
                    status: "done",
                    page: result.page,
                    perPage: result.perPage,
                    hits: result.hits,
                    total: result.total,
                    hasMore: result.hasMore,
                  }
                : t,
            ),
          ),
        )
        .catch((err: Error) =>
          setTurns((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, status: "error", error: err.message } : t,
            ),
          ),
        );
    },
    [addHistory, busy, fetchSearch],
  );

  const retry = useCallback(
    (turn: TurnRecord) => {
      if (busy) return;
      setTurns((prev) =>
        prev.map((t) => (t.id === turn.id ? { ...t, status: "loading" } : t)),
      );
      fetchSearch(turn.query, turn.provider, 1, turn.orientation ?? "all")
        .then((result) =>
          setTurns((prev) =>
            prev.map((t) =>
              t.id === turn.id
                ? {
                    ...t,
                    provider: result.provider,
                    status: "done",
                    page: result.page,
                    perPage: result.perPage,
                    hits: result.hits,
                    total: result.total,
                    hasMore: result.hasMore,
                  }
                : t,
            ),
          ),
        )
        .catch((err: Error) =>
          setTurns((prev) =>
            prev.map((t) =>
              t.id === turn.id
                ? { ...t, status: "error", error: err.message }
                : t,
            ),
          ),
        );
    },
    [busy, fetchSearch],
  );

  const loadMore = useCallback(
    (turn: TurnRecord) => {
      if (turn.status !== "done" || !turn.hasMore || turn.loadingMore) return;
      setTurns((prev) =>
        prev.map((t) => (t.id === turn.id ? { ...t, loadingMore: true } : t)),
      );
      fetchSearch(turn.query, turn.provider, turn.page + 1, turn.orientation ?? "all")
        .then((result) =>
          setTurns((prev) =>
            prev.map((t) => {
              if (t.id !== turn.id) return t;
              const existingKeys = new Set(t.hits.map((h) => `${h.provider}-${h.id}`));
              const newHits = result.hits.filter(
                (h) => !existingKeys.has(`${h.provider}-${h.id}`),
              );
              return {
                ...t,
                loadingMore: false,
                page: result.page,
                hits: [...t.hits, ...newHits],
                hasMore: result.hasMore,
              };
            }),
          ),
        )
        .catch((err: Error) =>
          setTurns((prev) =>
            prev.map((t) =>
              t.id === turn.id
                ? { ...t, loadingMore: false, error: err.message, status: "error" }
                : t,
            ),
          ),
        );
    },
    [fetchSearch],
  );

  const remove = useCallback((id: string) => {
    setTurns((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      submit((e as CustomEvent<string>).detail, "auto", "all");
    };
    window.addEventListener("canvas:search", handler);
    return () => window.removeEventListener("canvas:search", handler);
  }, [submit]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (!fromUrl) return;
    const timer = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("canvas:search", { detail: fromUrl }),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (turns.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [turns.length]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-black overflow-hidden">
      <AmbientCursorGlow />
      <MobileHeader />

      {turns.length === 0 ? (
        <div className="relative z-10 flex flex-1 flex-col items-center px-4 sm:px-6 py-12 md:py-16">
          <div className="text-center max-w-xl pt-10 sm:pt-16 md:pt-20">
            <h1 className="text-3xl font-extrabold tracking-wider text-white uppercase sm:text-4xl md:text-5xl font-mono">
              CHOOSE YOUR WALLPAPER
            </h1>
            <p className="mt-3 text-base text-zinc-400 font-mono tracking-wide">
              In less than Second !!
            </p>
          </div>

          <div className="w-full max-w-2xl mt-10 sm:mt-12">
            <Composer onSubmit={submit} disabled={busy} />
          </div>
        </div>
      ) : (
        <>
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-5xl space-y-12 pb-4">
              {turns.map((turn) => (
                <Turn
                  key={turn.id}
                  turn={turn}
                  onRemove={remove}
                  onRetry={retry}
                  onLoadMore={loadMore}
                  onPick={setPicked}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
              {turns[turns.length - 1].status !== "loading" &&
                turns.some((t) => t.status === "loading") && (
                  <p className="text-xs text-zinc-500 font-mono">
                    Fetching wallpapers…
                  </p>
                )}
            </div>
            <div ref={bottomRef} className="h-4" />
          </div>
          <div className="relative z-10 border-t border-border-soft/60 bg-black/90 px-4 py-4 backdrop-blur-lg sm:px-6">
            <Composer onSubmit={submit} disabled={busy} />
          </div>
        </>
      )}

      <Lightbox
        hit={picked}
        onClose={() => setPicked(null)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}