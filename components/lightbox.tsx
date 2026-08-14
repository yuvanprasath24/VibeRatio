"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { DownloadSize, ImageHit } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/providers/types";

interface LightboxProps {
  hit: ImageHit | null;
  onClose: () => void;
  isFavorite: (hit: ImageHit) => boolean;
  onToggleFavorite: (hit: ImageHit) => void;
}

function downloadUrl(size: DownloadSize, name: string): string {
  const params = new URLSearchParams({ url: size.url, name });
  return `/api/download?${params.toString()}`;
}

export function Lightbox({
  hit,
  onClose,
  isFavorite,
  onToggleFavorite,
}: LightboxProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!hit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [hit, isFullscreen, onClose]);

  if (!hit) return null;

  const fav = isFavorite(hit);
  const nameSlug = (hit.alt || hit.author || "wallpaper")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <Image
          src={hit.sizes.find((s) => s.key === "original")?.url || hit.preview}
          alt={hit.alt || hit.author}
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
        <div className="absolute top-4 right-4 z-[101] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Exit Fullscreen"
            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-white hover:bg-black/80"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
            Exit Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Wallpaper preview"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border-soft/80 bg-surface/95 backdrop-blur-2xl shadow-2xl shadow-black/80 md:grid md:grid-cols-[minmax(0,1fr)_340px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[42vh] shrink-0 bg-black/90 md:h-[78vh] group">
          <Image
            src={hit.preview}
            alt={hit.alt || hit.author}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            className="object-contain"
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Preview Fullscreen"
            className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 opacity-90 transition hover:bg-black/80 hover:scale-105"
            title="Preview Fullscreen"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5 sm:p-6 bg-surface/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white/90 border border-white/15">
                  {PROVIDERS[hit.provider].label}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {hit.width}×{hit.height}
                </span>
              </div>
              <h2 className="text-base font-semibold leading-snug text-foreground">
                {hit.alt || "Untitled wallpaper"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onToggleFavorite(hit)}
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition duration-200 ${
                fav
                  ? "bg-accent text-black shadow-md shadow-accent/20"
                  : "border border-border-soft bg-surface-2/60 text-zinc-400 hover:text-foreground hover:border-accent/40"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 21s-7.5-4.7-9.4-9.3C1 8 3.4 4.5 7 4.5c2.2 0 3.8 1.2 5 2.6 1.2-1.4 2.8-2.6 5-2.6 3.6 0 6 3.5 4.4 7.2C19.5 16.3 12 21 12 21Z" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Photo by{" "}
            {hit.authorUrl ? (
              <a
                href={hit.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {hit.author}
              </a>
            ) : (
              hit.author
            )}{" "}
            on{" "}
            <a
              href={hit.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              {PROVIDERS[hit.provider].label}
            </a>
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Download Resolutions
            </span>
            {hit.sizes.map((size) => (
              <a
                key={size.key}
                href={downloadUrl(size, nameSlug)}
                className="flex items-center justify-between rounded-xl border border-border-soft/70 bg-surface-2/80 px-3.5 py-2.5 text-xs text-zinc-300 transition duration-200 hover:border-accent/60 hover:text-foreground hover:bg-surface-2"
              >
                <span className="font-medium">{size.label}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
              </a>
            ))}
          </div>

          <a
            href={hit.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-3 text-xs text-zinc-500 underline hover:text-zinc-300"
          >
            View original photo page on {PROVIDERS[hit.provider].label}
          </a>
        </div>
      </div>
    </div>
  );
}