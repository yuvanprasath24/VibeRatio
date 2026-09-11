"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Download, Maximize2, Minimize2, ShoppingBag } from "lucide-react";
import type { DownloadSize, ImageHit } from "@/lib/providers/types";
import { PROVIDERS } from "@/lib/providers/types";

interface LightboxProps {
  hit: ImageHit | null;
  onClose: () => void;
  isInBasket: (hit: ImageHit) => boolean;
  onAddToBasket: (hit: ImageHit) => void;
  onRemoveFromBasket: (hit: ImageHit) => void;
}

function downloadUrl(size: DownloadSize, name: string): string {
  const params = new URLSearchParams({ url: size.url, name });
  return `/api/download?${params.toString()}`;
}

export function Lightbox({
  hit,
  onClose,
  isInBasket,
  onAddToBasket,
  onRemoveFromBasket,
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

  const currentHit = hit;
  const inBasket = isInBasket(currentHit);
  const nameSlug = (currentHit.alt || currentHit.author || "wallpaper")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);

  function handleBasketToggle() {
    if (inBasket) {
      onRemoveFromBasket(currentHit);
    } else {
      onAddToBasket(currentHit);
    }
  }

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
              <Minimize2 className="h-5 w-5" />
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
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white backdrop-blur-2xl shadow-2xl shadow-black/20 md:grid md:grid-cols-[minmax(0,1fr)_340px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[42vh] shrink-0 bg-zinc-100 md:h-[78vh] group">
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
            className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-zinc-800 backdrop-blur-md border border-black/10 opacity-90 transition hover:bg-white hover:scale-105"
            title="Preview Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5 sm:p-6 bg-zinc-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-zinc-700 border border-border-soft">
                  {PROVIDERS[hit.provider].label}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {hit.width}x{hit.height}
                </span>
              </div>
              <h2 className="text-base font-semibold leading-snug text-foreground">
                {hit.alt || "Untitled wallpaper"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleBasketToggle}
              aria-label={inBasket ? "Remove from basket" : "Add to basket"}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition duration-200 ${
                inBasket
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "border border-border-soft bg-zinc-100 text-zinc-600 hover:text-foreground hover:border-accent/40"
              }`}
            >
              {inBasket ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingBag className="h-5 w-5" />
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-600">
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
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-xs text-zinc-700 transition duration-200 hover:border-accent/60 hover:text-foreground hover:bg-zinc-50"
              >
                <span className="font-medium">{size.label}</span>
                <Download className="h-5 w-5 text-accent" />
              </a>
            ))}
          </div>

          <a
            href={hit.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-3 text-xs text-zinc-500 underline hover:text-zinc-700"
          >
            View original photo page on {PROVIDERS[hit.provider].label}
          </a>
        </div>
      </div>
    </div>
  );
}
