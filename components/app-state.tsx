"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { ImageHit } from "@/lib/providers/types";
import { useLocalStorage } from "@/hooks/use-local-storage";

export interface HistoryItem {
  q: string;
  ts: number;
}

interface AppStateValue {
  history: HistoryItem[];
  addHistory: (q: string) => void;
  clearHistory: () => void;
  favorites: ImageHit[];
  isFavorite: (hit: ImageHit) => boolean;
  toggleFavorite: (hit: ImageHit) => void;
}

const MAX_HISTORY = 20;
const MAX_FAVORITES = 100;

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(
    "canvas:history",
    [],
  );
  const [favorites, setFavorites] = useLocalStorage<ImageHit[]>(
    "canvas:favorites",
    [],
  );

  const addHistory = useCallback(
    (q: string) => {
      const clean = q.trim();
      if (!clean) return;
      setHistory((prev) => [
        { q: clean, ts: Date.now() },
        ...prev.filter(
          (item) => item.q.toLowerCase() !== clean.toLowerCase(),
        ),
      ].slice(0, MAX_HISTORY));
    },
    [setHistory],
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const isFavorite = useCallback(
    (hit: ImageHit) =>
      favorites.some((f) => f.provider === hit.provider && f.id === hit.id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (hit: ImageHit) => {
      setFavorites((prev) => {
        const exists = prev.some(
          (f) => f.provider === hit.provider && f.id === hit.id,
        );
        return exists
          ? prev.filter((f) => !(f.provider === hit.provider && f.id === hit.id))
          : [hit, ...prev].slice(0, MAX_FAVORITES);
      });
    },
    [setFavorites],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      history,
      addHistory,
      clearHistory,
      favorites,
      isFavorite,
      toggleFavorite,
    }),
    [history, addHistory, clearHistory, favorites, isFavorite, toggleFavorite],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used inside <AppStateProvider>");
  }
  return ctx;
}

export function emitSearch(q: string) {
  window.history.pushState({}, "", `/?q=${encodeURIComponent(q)}`);
  window.dispatchEvent(new CustomEvent("canvas:search", { detail: q }));
}