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

export interface BasketItem extends ImageHit {
  addedAt: number;
}

interface AppStateValue {
  history: HistoryItem[];
  addHistory: (q: string) => void;
  clearHistory: () => void;
  basket: BasketItem[];
  isInBasket: (hit: ImageHit) => boolean;
  addToBasket: (hit: ImageHit) => void;
  removeFromBasket: (hit: ImageHit) => void;
  basketCount: number;
}

const MAX_HISTORY = 20;
const MAX_BASKET = 50;
const BASKET_TTL_MS = 24 * 60 * 60 * 1000;

const AppStateContext = createContext<AppStateValue | null>(null);

function pruneExpired(items: BasketItem[]): BasketItem[] {
  const now = Date.now();
  return items.filter((item) => now - item.addedAt < BASKET_TTL_MS);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(
    "canvas:history",
    [],
  );
  const [rawBasket, setRawBasket] = useLocalStorage<BasketItem[]>(
    "canvas:basket",
    [],
  );

  const basket = useMemo(() => pruneExpired(rawBasket), [rawBasket]);

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

  const isInBasket = useCallback(
    (hit: ImageHit) =>
      basket.some((b) => b.provider === hit.provider && b.id === hit.id),
    [basket],
  );

  const addToBasket = useCallback(
    (hit: ImageHit) => {
      setRawBasket((prev) => {
        const pruned = pruneExpired(prev);
        const exists = pruned.some(
          (b) => b.provider === hit.provider && b.id === hit.id,
        );
        if (exists) return pruned;
        const item: BasketItem = { ...hit, addedAt: Date.now() };
        return [item, ...pruned].slice(0, MAX_BASKET);
      });
    },
    [setRawBasket],
  );

  const removeFromBasket = useCallback(
    (hit: ImageHit) => {
      setRawBasket((prev) =>
        prev.filter(
          (b) => !(b.provider === hit.provider && b.id === hit.id),
        ),
      );
    },
    [setRawBasket],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      history,
      addHistory,
      clearHistory,
      basket,
      isInBasket,
      addToBasket,
      removeFromBasket,
      basketCount: basket.length,
    }),
    [history, addHistory, clearHistory, basket, isInBasket, addToBasket, removeFromBasket],
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
