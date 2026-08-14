"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState, emitSearch } from "@/components/app-state";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { history, clearHistory, favorites } = useAppState();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border-soft bg-[#212121]">
      <div className="flex items-center px-4 h-16 border-b border-border-soft/50">
        <span className="text-base font-bold tracking-tight text-foreground bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          VibeRatio
        </span>
      </div>

      <nav className="px-3 pt-4 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
            pathname === "/"
              ? "bg-surface-2 text-foreground shadow-sm shadow-black/40 border border-border-soft/60"
              : "text-zinc-400 hover:bg-surface-2/60 hover:text-foreground"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
          </svg>
          New search
        </Link>
        <Link
          href="/favorites"
          className={`flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
            pathname === "/favorites"
              ? "bg-surface-2 text-foreground shadow-sm shadow-black/40 border border-border-soft/60"
              : "text-zinc-400 hover:bg-surface-2/60 hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 21s-7.5-4.7-9.4-9.3C1 8 3.4 4.5 7 4.5c2.2 0 3.8 1.2 5 2.6 1.2-1.4 2.8-2.6 5-2.6 3.6 0 6 3.5 4.4 7.2C19.5 16.3 12 21 12 21Z" />
            </svg>
            Favorites
          </span>
          {favorites.length > 0 && (
            <span className="rounded-full bg-accent/20 border border-accent/30 px-2 py-0.5 text-xs font-semibold text-accent">
              {favorites.length}
            </span>
          )}
        </Link>
      </nav>

      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Search History
          </span>
          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs text-zinc-500 transition hover:text-red-400"
            >
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="px-3 py-2 text-xs text-zinc-600 italic">
            Your search history will appear here.
          </p>
        ) : (
          <ul className="space-y-1">
            {history.map((item) => (
              <li key={`${item.q}-${item.ts}`}>
                <a
                  href={`/?q=${encodeURIComponent(item.q)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    emitSearch(item.q);
                  }}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-surface-2/80 hover:text-foreground"
                >
                  <span className="truncate">{item.q}</span>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {timeAgo(item.ts)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border-soft px-4 py-3 text.xs leading-relaxed text-zinc-600 text-[11px]">
        Wallpapers from{" "}
        <a href="https://www.pexels.com" className="underline hover:text-zinc-400" target="_blank" rel="noopener noreferrer">
          Pexels
        </a>{" "}
        &{" "}
        <a href="https://pixabay.com" className="underline hover:text-zinc-400" target="_blank" rel="noopener noreferrer">
          Pixabay
        </a>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const pathname = usePathname();
  const { history, clearHistory, favorites } = useAppState();
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border-soft bg-[#212121] px-4 h-14 backdrop-blur-lg">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          VibeRatio
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/favorites"
          className="flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-2/60 px-3 py-1 text-xs text-zinc-300"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7.5-4.7-9.4-9.3C1 8 3.4 4.5 7 4.5c2.2 0 3.8 1.2 5 2.6 1.2-1.4 2.8-2.6 5-2.6 3.6 0 6 3.5 4.4 7.2C19.5 16.3 12 21 12 21Z" />
          </svg>
          <span>{favorites.length}</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border-soft bg-surface-2/80 text-zinc-300"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={open ? "M18 6 6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-50 flex flex-col bg-background/95 backdrop-blur-xl p-4 sm:p-6">
          <nav className="space-y-2 pb-4 border-b border-border-soft">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                pathname === "/" ? "bg-surface-2 text-foreground" : "text-zinc-400"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
              </svg>
              New Search
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                pathname === "/favorites" ? "bg-surface-2 text-foreground" : "text-zinc-400"
              }`}
            >
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7.5-4.7-9.4-9.3C1 8 3.4 4.5 7 4.5c2.2 0 3.8 1.2 5 2.6 1.2-1.4 2.8-2.6 5-2.6 3.6 0 6 3.5 4.4 7.2C19.5 16.3 12 21 12 21Z" />
                </svg>
                Favorites
              </span>
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs text-accent font-semibold">
                {favorites.length}
              </span>
            </Link>
          </nav>

          <div className="mt-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Search History
              </span>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-red-400"
                >
                  Clear History
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-zinc-600 px-1 italic">No recent searches.</p>
            ) : (
              <div className="space-y-1">
                {history.map((item) => (
                  <button
                    key={`${item.q}-${item.ts}`}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      emitSearch(item.q);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-border-soft/40 bg-surface/60 px-4 py-2.5 text-left text-sm text-zinc-300 active:bg-surface-2"
                  >
                    <span className="truncate">{item.q}</span>
                    <span className="shrink-0 text-xs text-zinc-600">{timeAgo(item.ts)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}