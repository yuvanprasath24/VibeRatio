"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_EVENT = "canvas:localstorage";
const snapshotCache = new Map<string, unknown>();

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useLocalStorage<T>(
  key: string,
  fallback: T,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      const onStorage = (e: Event) => {
        if (e instanceof StorageEvent && e.key !== null && e.key !== key) {
          return;
        }
        cb();
      };
      window.addEventListener(STORAGE_EVENT, onStorage);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(STORAGE_EVENT, onStorage);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    const raw = readRaw(key);
    const cacheKey = `${key}\u0000${raw ?? "\u0000"}`;
    let cached = snapshotCache.get(cacheKey);
    if (cached === undefined) {
      cached = parse(raw, fallback);
      snapshotCache.set(cacheKey, cached);
    }
    return cached as T;
  }, [key, fallback]);

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = parse<T>(readRaw(key), fallback);
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      window.dispatchEvent(new Event(STORAGE_EVENT));
    },
    [key, fallback],
  );

  return [value, set];
}