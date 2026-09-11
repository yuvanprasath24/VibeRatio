"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  ShoppingBag,
  Menu,
  X,
  Search,
  Clock,
} from "lucide-react";
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

function NavLink({
  href,
  active,
  icon,
  label,
  badge,
  badgeColor = "accent",
  onClick,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  badgeColor?: "accent" | "rose";
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition duration-200 ${
        active
          ? "bg-surface-2 text-foreground shadow-sm shadow-black/5 border border-border-soft/60"
          : "text-zinc-500 hover:bg-surface-2/60 hover:text-foreground"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
      )}
      <span className="flex items-center gap-3">
        <span
          className={active ? "text-accent" : "text-zinc-400 group-hover:text-foreground"}
        >
          {icon}
        </span>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            badgeColor === "accent"
              ? "bg-accent/20 border border-accent/30 text-accent"
              : "bg-rose-500/20 border border-rose-500/30 text-rose-500"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { history, clearHistory, basketCount } = useAppState();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border-soft bg-white">
      <div className="flex items-center px-4 h-16 border-b border-border-soft/50">
        <Link href="/" className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 bg-clip-text text-transparent">
          VibeRatio
        </Link>
      </div>

      <nav className="px-3 pt-4 space-y-1.5">
        <NavLink
          href="/"
          active={pathname === "/"}
          icon={<MessageSquare className="h-5 w-5" />}
          label="New Search"
        />
        <NavLink
          href="/basket"
          active={pathname === "/basket"}
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Basket"
          badge={basketCount}
        />
      </nav>

      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
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
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-surface-2/80 hover:text-foreground"
                >
                  <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span className="truncate">{item.q}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-zinc-400">
                    {timeAgo(item.ts)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border-soft px-4 py-3 leading-relaxed text-zinc-500 text-[11px]">
        Wallpapers from{" "}
        <a href="https://www.pexels.com" className="underline hover:text-zinc-700" target="_blank" rel="noopener noreferrer">
          Pexels
        </a>
        ,{" "}
        <a href="https://pixabay.com" className="underline hover:text-zinc-700" target="_blank" rel="noopener noreferrer">
          Pixabay
        </a>
        {/* NOTE: Unsplash disabled — API ToS does not permit wallpaper apps.
        {" "}&{" "}
        <a href="https://unsplash.com" className="underline hover:text-zinc-700" target="_blank" rel="noopener noreferrer">
          Unsplash
        </a>
        */}
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const pathname = usePathname();
  const { history, clearHistory, basketCount } = useAppState();
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border-soft bg-white px-4 h-14 backdrop-blur-lg">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-base font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 bg-clip-text text-transparent">
          VibeRatio
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/basket"
          aria-label="Open basket"
          className="flex h-10 items-center gap-1.5 rounded-full border border-border-soft bg-surface-2/60 px-3.5 text-sm text-zinc-600"
        >
          <ShoppingBag className="h-5 w-5 text-accent" />
          {basketCount > 0 && <span className="font-semibold text-foreground">{basketCount}</span>}
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-border-soft bg-surface-2/80 text-zinc-600"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-50 flex flex-col bg-background/95 backdrop-blur-xl p-4 sm:p-6">
          <nav className="space-y-2 pb-4 border-b border-border-soft">
            <NavLink
              href="/"
              active={pathname === "/"}
              icon={<MessageSquare className="h-5 w-5" />}
              label="New Search"
              onClick={() => setOpen(false)}
            />
            <NavLink
              href="/basket"
              active={pathname === "/basket"}
              icon={<ShoppingBag className="h-5 w-5" />}
              label="Basket"
              badge={basketCount}
              onClick={() => setOpen(false)}
            />
          </nav>

          <div className="mt-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <Clock className="h-4 w-4" />
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
                    className="flex w-full items-center gap-2.5 rounded-xl border border-border-soft/40 bg-surface/60 px-4 py-3 text-left text-sm text-zinc-600 active:bg-surface-2"
                  >
                    <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="truncate">{item.q}</span>
                    <span className="ml-auto shrink-0 text-xs text-zinc-400">{timeAgo(item.ts)}</span>
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